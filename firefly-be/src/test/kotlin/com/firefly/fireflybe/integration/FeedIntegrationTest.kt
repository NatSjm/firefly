package com.firefly.fireflybe.integration

import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.test.web.servlet.get

class FeedIntegrationTest : IntegrationTestBase() {

    // @trace FR-FEED-01
    @Test
    fun `feed shows only public memories, newest first, anonymously`() {
        val author = register()
        val older = createMemory(author, title = "Старіший", isPublic = true)
        createMemory(author, title = "Приватний", isPublic = false)
        val newer = createMemory(author, title = "Новіший", isPublic = true)

        mockMvc.get("/api/feed").andExpect {
            status { isOk() }
            jsonPath("$.total") { value(2) }
            jsonPath("$.items[0].id") { value(newer.toInt()) }
            jsonPath("$.items[1].id") { value(older.toInt()) }
        }
    }

    // @trace FR-FEED-02
    @Test
    fun `feed filters by city and topic`() {
        val author = register()
        val kyiv = createMemory(author, title = "Київська", city = "Київ", topicSlug = "childhood")
        createMemory(author, title = "Львівська", city = "Львів", topicSlug = "recipes")

        mockMvc.get("/api/feed?city=Київ").andExpect {
            status { isOk() }
            jsonPath("$.total") { value(1) }
            jsonPath("$.items[0].id") { value(kyiv.toInt()) }
        }

        mockMvc.get("/api/feed?topic=childhood").andExpect {
            status { isOk() }
            jsonPath("$.total") { value(1) }
            jsonPath("$.items[0].id") { value(kyiv.toInt()) }
        }

        mockMvc.get("/api/feed?city=Одеса").andExpect {
            status { isOk() }
            jsonPath("$.total") { value(0) }
        }
    }

    // @trace FR-FEED-03
    @Test
    fun `popular sort orders by like count`() {
        val author = register()
        val liker1 = register(email = "liker1@example.com")
        val liker2 = register(email = "liker2@example.com")

        val quiet = createMemory(author, title = "Без лайків")
        val popular = createMemory(author, title = "Популярний")
        likeMemory(liker1, popular)
        likeMemory(liker2, popular)

        mockMvc.get("/api/feed?sort=popular").andExpect {
            status { isOk() }
            jsonPath("$.items[0].id") { value(popular.toInt()) }
            jsonPath("$.items[0].likesCount") { value(2) }
            jsonPath("$.items[1].id") { value(quiet.toInt()) }
        }
    }

    // @trace FR-FEED-01
    @Test
    fun `feed paginates results`() {
        val author = register()
        repeat(3) { createMemory(author, title = "Спогад $it") }

        mockMvc.get("/api/feed?page=0&size=2").andExpect {
            status { isOk() }
            jsonPath("$.items.length()") { value(2) }
            jsonPath("$.total") { value(3) }
            jsonPath("$.totalPages") { value(2) }
            jsonPath("$.page") { value(0) }
        }

        mockMvc.get("/api/feed?page=1&size=2").andExpect {
            status { isOk() }
            jsonPath("$.items.length()") { value(1) }
        }
    }

    // @trace FR-SOC-01
    @Test
    fun `feed marks memories liked by the current user`() {
        val author = register()
        val liker = register(email = "liker@example.com")
        val memoryId = createMemory(author, title = "Уподобаний")
        likeMemory(liker, memoryId)

        mockMvc.get("/api/feed") {
            header(HttpHeaders.AUTHORIZATION, bearer(liker))
        }.andExpect {
            status { isOk() }
            jsonPath("$.items[0].likedByMe") { value(true) }
        }

        mockMvc.get("/api/feed") {
            header(HttpHeaders.AUTHORIZATION, bearer(author))
        }.andExpect {
            status { isOk() }
            jsonPath("$.items[0].likedByMe") { value(false) }
        }
    }
}
