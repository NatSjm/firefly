package com.firefly.fireflybe.feed

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.config.AppProperties
import com.firefly.fireflybe.likes.LikeRepository
import com.firefly.fireflybe.memories.Memory
import com.firefly.fireflybe.memories.MemoryDto
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.lang.reflect.Proxy
import java.util.Optional
import kotlin.test.assertEquals

// @trace FR-FEED-01, FR-FEED-02, FR-FEED-03, FR-FEED-04, FR-FEED-05

class FeedServiceTest {

    private val repo = RecordingMemoryRepository()
    private val memoryService = RecordingMemoryService()
    private val service = FeedService(repo.proxy, memoryService)

    private fun stubMemory(id: Long = 1L) = Memory(
        id = id,
        user = User(id = 1L, name = "Test", email = "test@example.com", passwordHash = "hash"),
        title = "T",
        text = "X",
        isPublic = true
    )

    private fun stubDto(id: Long = 1L) = MemoryDto(
        id = id,
        userId = 1L,
        authorName = "Test",
        type = "story",
        title = "T",
        text = "X",
        ingredients = null,
        steps = null,
        city = null,
        topicSlug = null,
        yearFrom = null,
        yearTo = null,
        isPublic = true,
        mediaUrls = emptyList(),
        likesCount = 0,
        commentsCount = 0,
        likedByMe = false,
        createdAt = "2024-01-01T00:00:00Z",
        updatedAt = null
    )

    // @trace FR-FEED-01
    @Test
    fun `getFeed with sort=new calls findPublicByFilters`() {
        repo.nextPublicPage = PageImpl(emptyList(), PageRequest.of(0, 20), 0)

        service.getFeed(null, null, "new", 0, 20, null)

        assertEquals("new", repo.lastMethod)
        assertEquals(null, repo.lastCity)
        assertEquals(null, repo.lastTopic)
    }

    // @trace FR-FEED-05
    @Test
    fun `getFeed with sort=popular calls findPublicByFiltersOrderByPopularity`() {
        repo.nextPopularPage = PageImpl(emptyList(), PageRequest.of(0, 20), 0)

        service.getFeed(null, null, "popular", 0, 20, null)

        assertEquals("popular", repo.lastMethod)
        assertEquals(null, repo.lastCity)
        assertEquals(null, repo.lastTopic)
    }

    // @trace FR-FEED-02
    @Test
    fun `getFeed passes city filter to repository`() {
        repo.nextPublicPage = PageImpl(emptyList(), PageRequest.of(0, 20), 0)

        service.getFeed("Київ", null, "new", 0, 20, null)

        assertEquals("Київ", repo.lastCity)
        assertEquals(null, repo.lastTopic)
    }

    // @trace FR-FEED-03
    @Test
    fun `getFeed passes topic filter to repository`() {
        repo.nextPublicPage = PageImpl(emptyList(), PageRequest.of(0, 20), 0)

        service.getFeed(null, "school", "new", 0, 20, null)

        assertEquals(null, repo.lastCity)
        assertEquals("school", repo.lastTopic)
    }

    // @trace FR-FEED-01, FR-FEED-06
    @Test
    fun `getFeed maps memories to DTOs and returns paged response`() {
        val memory = stubMemory()
        val dto = stubDto()
        repo.nextPublicPage = PageImpl(listOf(memory), PageRequest.of(0, 20), 1)
        memoryService.nextDto = dto

        val response = service.getFeed(null, null, "new", 0, 20, null)

        assertEquals(1, response.items.size)
        assertEquals(dto, response.items[0])
        assertEquals(1L, response.total)
        assertEquals(0, response.page)
    }

    // @trace FR-FEED-02
    @Test
    fun `getFeed trims blank city filter to null`() {
        repo.nextPublicPage = PageImpl(emptyList(), PageRequest.of(0, 20), 0)

        service.getFeed("  ", null, "new", 0, 20, null)

        assertEquals(null, repo.lastCity)
        assertEquals(null, repo.lastTopic)
    }

    private class RecordingMemoryService : MemoryService(
        unusedProxy(),
        unusedProxy(),
        unusedProxy(),
        AppProperties()
    ) {
        lateinit var nextDto: MemoryDto

        override fun enrichDto(memory: Memory, currentUserId: Long?): MemoryDto = nextDto
    }

    private class RecordingMemoryRepository {
        var lastMethod: String? = null
        var lastCity: String? = null
        var lastTopic: String? = null
        var nextPublicPage = PageImpl<Memory>(emptyList(), PageRequest.of(0, 20), 0)
        var nextPopularPage = PageImpl<Memory>(emptyList(), PageRequest.of(0, 20), 0)

        val proxy: MemoryRepository =
            Proxy.newProxyInstance(
                MemoryRepository::class.java.classLoader,
                arrayOf(MemoryRepository::class.java)
            ) { _, method, args ->
                when (method.name) {
                    "findPublicByFilters" -> {
                        lastMethod = "new"
                        lastCity = args?.get(0) as String?
                        lastTopic = args?.get(1) as String?
                        nextPublicPage
                    }
                    "findPublicByFiltersOrderByPopularity" -> {
                        lastMethod = "popular"
                        lastCity = args?.get(0) as String?
                        lastTopic = args?.get(1) as String?
                        nextPopularPage
                    }
                    "findById" -> Optional.empty<Memory>()
                    "equals" -> false
                    "hashCode" -> System.identityHashCode(this)
                    "toString" -> "RecordingMemoryRepository"
                    else -> throw UnsupportedOperationException("unexpected call: ${method.name}")
                }
            } as MemoryRepository
    }

    private companion object {
        private inline fun <reified T> unusedProxy(): T =
            Proxy.newProxyInstance(T::class.java.classLoader, arrayOf(T::class.java)) { _, method, _ ->
                throw UnsupportedOperationException("unexpected call: ${method.name}")
            } as T
    }
}
