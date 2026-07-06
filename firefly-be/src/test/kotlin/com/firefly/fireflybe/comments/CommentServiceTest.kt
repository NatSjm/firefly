package com.firefly.fireflybe.comments

import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.config.AppProperties
import com.firefly.fireflybe.likes.LikeRepository
import com.firefly.fireflybe.memories.Memory
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import java.lang.reflect.Proxy
import java.time.Instant
import java.util.Optional
import kotlin.test.assertEquals

// @trace FR-COMMENT-01, FR-COMMENT-02

class CommentServiceTest {

    private val owner = User(id = 1L, name = "User 1", email = "u1@t.com", passwordHash = "x")
    private val memory = Memory(
        id = 10L,
        user = User(id = 2L, name = "Author", email = "author@t.com", passwordHash = "x"),
        title = "Спогад",
        text = "Текст",
        isPublic = true
    )
    private val memoryRepository = singleMemoryRepository(memory)
    private val likeRepository = unusedProxy<LikeRepository>()
    private val commentRepository = RecordingCommentRepository()
    private val memoryService = MemoryService(memoryRepository, likeRepository, commentRepository.proxy, AppProperties())
    private val service = CommentService(commentRepository.proxy, memoryService)

    private fun user(id: Long = 1L, role: String = "user") =
        User(id = id, name = "User $id", email = "u$id@t.com", passwordHash = "x", role = role)

    private fun comment(id: Long, commentOwner: User, mem: Memory) = Comment(
        id = id,
        user = commentOwner,
        memory = mem,
        text = "Hello",
        createdAt = Instant.now()
    )

    // @trace FR-COMMENT-01
    @Test
    fun `list returns comments mapped to DTOs in ascending order`() {
        val comments = listOf(
            comment(1L, owner, memory),
            comment(2L, owner, memory)
        )
        commentRepository.commentsForList = comments

        val result = service.list(10L, null)

        assertEquals(2, result.size)
        assertEquals(1L, result[0].id)
        assertEquals(2L, result[1].id)
    }

    // @trace FR-COMMENT-01
    @Test
    fun `add persists comment and returns DTO`() {
        val req = CommentRequest(text = "Great memory")
        val saved = comment(5L, owner, memory).apply { text = "Great memory" }
        commentRepository.saveResult = saved

        val result = service.add(10L, owner, req)

        assertEquals("Great memory", commentRepository.savedComment?.text)
        assertEquals("Great memory", result.text)
    }

    // @trace FR-COMMENT-02
    @Test
    fun `delete allows owner to delete their own comment`() {
        val c = comment(5L, owner, memory)
        commentRepository.commentById = c

        service.delete(10L, 5L, owner)

        assertEquals(c, commentRepository.deletedComment)
    }

    // @trace FR-COMMENT-02
    @Test
    fun `delete throws 403 when non-owner non-admin tries to delete`() {
        val c = comment(5L, owner, memory)
        commentRepository.commentById = c

        val exception = assertThrows<ApiException> {
            service.delete(10L, 5L, user(2L))
        }

        assertEquals(HttpStatus.FORBIDDEN, exception.status)
    }

    // @trace FR-COMMENT-02
    @Test
    fun `delete throws 404 for comment on wrong memory`() {
        val c = comment(5L, owner, memory.copyWithId(99L))
        commentRepository.commentById = c

        val exception = assertThrows<ApiException> {
            service.delete(10L, 5L, owner)
        }

        assertEquals(HttpStatus.NOT_FOUND, exception.status)
    }

    private class RecordingCommentRepository {
        var commentsForList: List<Comment> = emptyList()
        var saveResult: Comment? = null
        var savedComment: Comment? = null
        var commentById: Comment? = null
        var deletedComment: Comment? = null

        val proxy: CommentRepository =
            Proxy.newProxyInstance(
                CommentRepository::class.java.classLoader,
                arrayOf(CommentRepository::class.java)
            ) { _, method, args ->
                when (method.name) {
                    "findByMemoryIdOrderByCreatedAtAsc" -> commentsForList
                    "save" -> {
                        savedComment = args?.get(0) as Comment
                        saveResult ?: savedComment
                    }
                    "findById" -> Optional.ofNullable(commentById)
                    "delete" -> {
                        deletedComment = args?.get(0) as Comment
                        Unit
                    }
                    "countByMemoryId" -> commentsForList.size.toLong()
                    "equals" -> false
                    "hashCode" -> System.identityHashCode(this)
                    "toString" -> "RecordingCommentRepository"
                    else -> throw UnsupportedOperationException("unexpected call: ${method.name}")
                }
            } as CommentRepository
    }

    private companion object {
        private fun Memory.copyWithId(newId: Long) = Memory(
            id = newId,
            user = user,
            type = type,
            title = title,
            text = text,
            ingredients = ingredients,
            steps = steps,
            city = city,
            topicSlug = topicSlug,
            yearFrom = yearFrom,
            yearTo = yearTo,
            isPublic = isPublic
        )

        private fun singleMemoryRepository(memory: Memory): MemoryRepository =
            Proxy.newProxyInstance(
                MemoryRepository::class.java.classLoader,
                arrayOf(MemoryRepository::class.java)
            ) { _, method, _ ->
                when (method.name) {
                    "findById" -> Optional.of(memory)
                    "equals" -> false
                    "hashCode" -> 1
                    "toString" -> "SingleMemoryRepository"
                    else -> throw UnsupportedOperationException("unexpected call: ${method.name}")
                }
            } as MemoryRepository

        private inline fun <reified T> unusedProxy(): T =
            Proxy.newProxyInstance(T::class.java.classLoader, arrayOf(T::class.java)) { _, method, _ ->
                throw UnsupportedOperationException("unexpected call: ${method.name}")
            } as T
    }
}
