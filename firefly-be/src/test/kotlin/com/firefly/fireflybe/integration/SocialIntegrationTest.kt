package com.firefly.fireflybe.integration

import com.jayway.jsonpath.JsonPath
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MvcResult
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

class SocialIntegrationTest : IntegrationTestBase() {

    // @trace FR-SOC-01
    @Test
    fun `like toggles on and off with correct counts`() {
        val author = register()
        val liker = register(email = "liker@example.com")
        val memoryId = createMemory(author)

        mockMvc.post("/api/likes") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"memoryId":$memoryId}"""
            header(HttpHeaders.AUTHORIZATION, bearer(liker))
        }.andExpect {
            status { isOk() }
            jsonPath("$.liked") { value(true) }
            jsonPath("$.count") { value(1) }
        }

        mockMvc.post("/api/likes") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"memoryId":$memoryId}"""
            header(HttpHeaders.AUTHORIZATION, bearer(liker))
        }.andExpect {
            status { isOk() }
            jsonPath("$.liked") { value(false) }
            jsonPath("$.count") { value(0) }
        }
    }

    // @trace FR-SOC-01
    @Test
    fun `liking requires authentication and an accessible memory`() {
        val author = register()
        val stranger = register(email = "stranger@example.com")
        val privateMemory = createMemory(author, isPublic = false)

        mockMvc.post("/api/likes") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"memoryId":$privateMemory}"""
        }.andExpect { status { isUnauthorized() } }

        mockMvc.post("/api/likes") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"memoryId":$privateMemory}"""
            header(HttpHeaders.AUTHORIZATION, bearer(stranger))
        }.andExpect { status { isForbidden() } }

        mockMvc.post("/api/likes") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"memoryId":999999}"""
            header(HttpHeaders.AUTHORIZATION, bearer(stranger))
        }.andExpect { status { isNotFound() } }
    }

    // @trace FR-SOC-02
    @Test
    fun `comments are added and listed oldest first`() {
        val author = register()
        val commenter = register(email = "commenter@example.com", name = "Коментаторка")
        val memoryId = createMemory(author)

        addComment(commenter, memoryId, "Перший коментар")
        addComment(commenter, memoryId, "Другий коментар")

        mockMvc.get("/api/memories/$memoryId/comments").andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(2) }
            jsonPath("$[0].text") { value("Перший коментар") }
            jsonPath("$[1].text") { value("Другий коментар") }
            jsonPath("$[0].authorName") { value("Коментаторка") }
        }

        mockMvc.get("/api/memories/$memoryId").andExpect {
            jsonPath("$.commentsCount") { value(2) }
        }
    }

    // @trace FR-SOC-02
    @Test
    fun `comments on a private memory are restricted`() {
        val author = register()
        val stranger = register(email = "stranger@example.com")
        val privateMemory = createMemory(author, isPublic = false)

        mockMvc.post("/api/memories/$privateMemory/comments") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"text":"Не можна"}"""
            header(HttpHeaders.AUTHORIZATION, bearer(stranger))
        }.andExpect { status { isForbidden() } }

        mockMvc.get("/api/memories/$privateMemory/comments") {
            header(HttpHeaders.AUTHORIZATION, bearer(stranger))
        }.andExpect { status { isForbidden() } }

        mockMvc.get("/api/memories/$privateMemory/comments") {
            header(HttpHeaders.AUTHORIZATION, bearer(author))
        }.andExpect { status { isOk() } }
    }

    // @trace FR-SOC-02 FR-ADMIN-02
    @Test
    fun `comment can be deleted by author or admin but not others`() {
        val author = register()
        val commenter = register(email = "commenter@example.com")
        val stranger = register(email = "stranger@example.com")
        val admin = registerAdmin()
        val memoryId = createMemory(author)

        val own = commentId(addComment(commenter, memoryId, "Мій коментар"))
        val forAdmin = commentId(addComment(commenter, memoryId, "Видалить адмін"))

        mockMvc.delete("/api/memories/$memoryId/comments/$own") {
            header(HttpHeaders.AUTHORIZATION, bearer(stranger))
        }.andExpect { status { isForbidden() } }

        mockMvc.delete("/api/memories/$memoryId/comments/$own") {
            header(HttpHeaders.AUTHORIZATION, bearer(commenter))
        }.andExpect { status { isNoContent() } }

        mockMvc.delete("/api/memories/$memoryId/comments/$forAdmin") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect { status { isNoContent() } }
    }

    // @trace FR-SOC-02
    @Test
    fun `deleting a comment through the wrong memory id is not found`() {
        val author = register()
        val memoryA = createMemory(author, title = "А")
        val memoryB = createMemory(author, title = "Б")
        val comment = commentId(addComment(author, memoryA, "На спогаді А"))

        mockMvc.delete("/api/memories/$memoryB/comments/$comment") {
            header(HttpHeaders.AUTHORIZATION, bearer(author))
        }.andExpect { status { isNotFound() } }
    }

    private fun addComment(token: String, memoryId: Long, text: String): MvcResult =
        mockMvc.post("/api/memories/$memoryId/comments") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"text":"$text"}"""
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect { status { isCreated() } }.andReturn()

    private fun commentId(result: MvcResult): Long =
        JsonPath.read<Number>(result.response.contentAsString, "$.id").toLong()
}
