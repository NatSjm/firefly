package com.firefly.fireflybe.integration

import com.jayway.jsonpath.JsonPath
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

class AuthIntegrationTest : IntegrationTestBase() {

    // @trace FR-AUTH-01 FR-AUTH-02
    @Test
    fun `register returns a token that authenticates on me`() {
        val result = mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"nova@example.com","password":"password123","name":"Нова Користувачка"}"""
        }.andExpect {
            status { isCreated() }
            jsonPath("$.token") { isNotEmpty() }
            jsonPath("$.user.email") { value("nova@example.com") }
            jsonPath("$.user.role") { value("user") }
        }.andReturn()

        val token = JsonPath.read<String>(result.response.contentAsString, "$.token")
        mockMvc.get("/api/auth/me") {
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect {
            status { isOk() }
            jsonPath("$.email") { value("nova@example.com") }
            jsonPath("$.name") { value("Нова Користувачка") }
        }
    }

    // @trace FR-AUTH-01
    @Test
    fun `register normalizes email casing and rejects duplicates`() {
        register(email = "MiXeD@Example.COM")

        mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"mixed@example.com","password":"password123","name":"Дублікат"}"""
        }.andExpect { status { isConflict() } }

        mockMvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"mixed@example.com","password":"password123"}"""
        }.andExpect {
            status { isOk() }
            jsonPath("$.user.email") { value("mixed@example.com") }
        }
    }

    // @trace FR-AUTH-01
    @Test
    fun `register rejects a too short password`() {
        mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"short@example.com","password":"1234567","name":"Коротка"}"""
        }.andExpect { status { isBadRequest() } }
    }

    // @trace FR-AUTH-02
    @Test
    fun `login with a wrong password is unauthorized`() {
        register(email = "secure@example.com", password = "correct-password")

        mockMvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"secure@example.com","password":"wrong-password"}"""
        }.andExpect { status { isUnauthorized() } }
    }

    // @trace FR-AUTH-02
    @Test
    fun `me without a token is unauthorized`() {
        mockMvc.get("/api/auth/me").andExpect { status { isUnauthorized() } }
    }

    // @trace FR-ADMIN-03
    @Test
    fun `banned user cannot log in and existing token stops working`() {
        val token = register(email = "banned@example.com")
        val user = userRepository.findByEmail("banned@example.com").orElseThrow()
        user.isBanned = true
        userRepository.save(user)

        mockMvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"banned@example.com","password":"password123"}"""
        }.andExpect { status { isForbidden() } }

        mockMvc.get("/api/auth/me") {
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect { status { isUnauthorized() } }
    }
}
