package com.firefly.fireflybe.integration

import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

class AdminIntegrationTest : IntegrationTestBase() {

    // @trace FR-ADMIN-01
    @Test
    fun `admin area is closed to anonymous and regular users`() {
        mockMvc.get("/api/admin/users").andExpect { status { isUnauthorized() } }

        val user = register()
        mockMvc.get("/api/admin/users") {
            header(HttpHeaders.AUTHORIZATION, bearer(user))
        }.andExpect { status { isForbidden() } }
    }

    // @trace FR-ADMIN-01
    @Test
    fun `admin lists users and reports`() {
        register(email = "person@example.com")
        val admin = registerAdmin()

        mockMvc.get("/api/admin/users") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(2) }
        }

        val author = register(email = "author@example.com")
        val memoryId = createMemory(author)
        mockMvc.post("/api/reports") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"targetType":"memory","targetId":$memoryId,"reason":"Скарга"}"""
            header(HttpHeaders.AUTHORIZATION, bearer(author))
        }.andExpect { status { isCreated() } }

        mockMvc.get("/api/admin/reports") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].targetType") { value("memory") }
        }
    }

    // @trace FR-ADMIN-03
    @Test
    fun `ban toggles and blocks the user, but self and admins are protected`() {
        val admin = registerAdmin()
        register(email = "target@example.com")
        val targetId = userIdByEmail("target@example.com")
        val adminId = userIdByEmail("admin@example.com")

        mockMvc.post("/api/admin/users/$targetId/ban") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect {
            status { isOk() }
            jsonPath("$.banned") { value(true) }
        }

        mockMvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"target@example.com","password":"password123"}"""
        }.andExpect { status { isForbidden() } }

        mockMvc.post("/api/admin/users/$targetId/ban") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect {
            status { isOk() }
            jsonPath("$.banned") { value(false) }
        }

        mockMvc.post("/api/admin/users/$adminId/ban") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect { status { isBadRequest() } }

        mockMvc.post("/api/admin/users/999999/ban") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect { status { isNotFound() } }
    }

    // @trace FR-ADMIN-02
    @Test
    fun `admin deletes a reported memory together with its reports`() {
        val author = register(email = "author@example.com")
        val admin = registerAdmin()
        val memoryId = createMemory(author, title = "На видалення")

        mockMvc.post("/api/reports") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"targetType":"memory","targetId":$memoryId}"""
            header(HttpHeaders.AUTHORIZATION, bearer(author))
        }.andExpect { status { isCreated() } }

        mockMvc.delete("/api/admin/memories/$memoryId") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect { status { isNoContent() } }

        mockMvc.get("/api/memories/$memoryId").andExpect { status { isNotFound() } }
        mockMvc.get("/api/admin/reports") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(0) }
        }

        mockMvc.delete("/api/admin/memories/999999") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect { status { isNotFound() } }
    }

    // @trace FR-ADMIN-02
    @Test
    fun `admin deletes a reported comment together with its reports`() {
        val author = register(email = "author@example.com")
        val admin = registerAdmin()
        val memoryId = createMemory(author)

        val commentResult = mockMvc.post("/api/memories/$memoryId/comments") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"text":"Поганий коментар"}"""
            header(HttpHeaders.AUTHORIZATION, bearer(author))
        }.andExpect { status { isCreated() } }.andReturn()
        val commentId = com.jayway.jsonpath.JsonPath.read<Number>(
            commentResult.response.contentAsString, "$.id"
        ).toLong()

        mockMvc.post("/api/reports") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"targetType":"comment","targetId":$commentId}"""
            header(HttpHeaders.AUTHORIZATION, bearer(author))
        }.andExpect { status { isCreated() } }

        mockMvc.delete("/api/admin/comments/$commentId") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect { status { isNoContent() } }

        mockMvc.get("/api/memories/$memoryId/comments").andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(0) }
        }
        mockMvc.get("/api/admin/reports") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect {
            jsonPath("$.length()") { value(0) }
        }
    }
}
