package com.firefly.fireflybe.likes

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.config.AppProperties
import com.firefly.fireflybe.memories.Memory
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import org.junit.jupiter.api.Test
import java.lang.reflect.Proxy
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

// @trace FR-LIKE-01, FR-LIKE-02

class LikeServiceTest {

    private val memory = Memory(
        id = 10L,
        user = User(id = 2L, email = "owner@example.com", passwordHash = "hash", name = "Owner"),
        title = "Спогад",
        text = "Текст",
        isPublic = true
    )

    private val memoryRepository = singleMemoryRepository(memory)
    private val commentRepository = unusedProxy<CommentRepository>()
    private val likeRepository = RecordingLikeRepository()
    private val memoryService = MemoryService(memoryRepository, likeRepository.proxy, commentRepository, AppProperties())
    private val service = LikeService(likeRepository.proxy, memoryService)

    private fun user(id: Long = 1L) = User(id = id, name = "Test", email = "t$id@t.com", passwordHash = "x")

    // @trace FR-LIKE-01
    @Test
    fun `toggle adds like when no existing like`() {
        likeRepository.existingLike = null
        likeRepository.count = 1L

        val result = service.toggle(user(), 10L)

        assertTrue(likeRepository.savedLike != null)
        assertTrue(result.liked)
        assertEquals(1L, result.count)
    }

    // @trace FR-LIKE-01, FR-LIKE-02
    @Test
    fun `toggle removes like when existing like present`() {
        val actor = user()
        likeRepository.existingLike = Like(id = 99L, user = actor, memory = memory)
        likeRepository.count = 0L

        val result = service.toggle(actor, 10L)

        assertEquals(likeRepository.existingLike, likeRepository.deletedLike)
        assertTrue(likeRepository.savedLike == null)
        assertFalse(result.liked)
        assertEquals(0L, result.count)
    }

    // @trace FR-LIKE-02
    @Test
    fun `toggle returns correct count from repository`() {
        likeRepository.existingLike = null
        likeRepository.count = 5L

        val result = service.toggle(user(), 10L)

        assertEquals(5L, result.count)
    }

    private class RecordingLikeRepository {
        var existingLike: Like? = null
        var count: Long = 0
        var savedLike: Like? = null
        var deletedLike: Like? = null

        val proxy: LikeRepository =
            Proxy.newProxyInstance(
                LikeRepository::class.java.classLoader,
                arrayOf(LikeRepository::class.java)
            ) { _, method, args ->
                when (method.name) {
                    "findByUserIdAndMemoryId" -> existingLike
                    "countByMemoryId" -> count
                    "save" -> {
                        savedLike = args?.get(0) as Like
                        savedLike
                    }
                    "delete" -> {
                        deletedLike = args?.get(0) as Like
                        Unit
                    }
                    "equals" -> false
                    "hashCode" -> System.identityHashCode(this)
                    "toString" -> "RecordingLikeRepository"
                    else -> throw UnsupportedOperationException("unexpected call: ${method.name}")
                }
            } as LikeRepository
    }

    private companion object {
        private fun singleMemoryRepository(memory: Memory): MemoryRepository =
            Proxy.newProxyInstance(
                MemoryRepository::class.java.classLoader,
                arrayOf(MemoryRepository::class.java)
            ) { _, method, args ->
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
