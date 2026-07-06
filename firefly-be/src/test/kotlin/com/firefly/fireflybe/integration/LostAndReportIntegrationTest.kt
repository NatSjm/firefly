package com.firefly.fireflybe.integration

import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

class LostAndReportIntegrationTest : IntegrationTestBase() {

    // @trace FR-LOST-01
    @Test
    fun `lost request is created by an authenticated user and readable anonymously`() {
        val token = register(name = "Шукачка")

        mockMvc.post("/api/lost-requests") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"city":"Херсон","type":"person","years":"1990-1995",""" +
                """"description":"Шукаю сусідів з вулиці Садової","contactEmail":"contact@example.com"}"""
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect {
            status { isCreated() }
            jsonPath("$.city") { value("Херсон") }
            jsonPath("$.authorName") { value("Шукачка") }
        }

        mockMvc.get("/api/lost-requests").andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].description") { value("Шукаю сусідів з вулиці Садової") }
        }

        mockMvc.get("/api/lost-requests/1").andExpect { status { isOk() } }
        mockMvc.get("/api/lost-requests/999999").andExpect { status { isNotFound() } }
    }

    // @trace FR-LOST-01
    @Test
    fun `lost request creation requires authentication and a valid contact email`() {
        mockMvc.post("/api/lost-requests") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"city":"Київ","type":"place","description":"Опис","contactEmail":"a@b.c"}"""
        }.andExpect { status { isUnauthorized() } }

        val token = register()
        mockMvc.post("/api/lost-requests") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"city":"Київ","type":"place","description":"Опис","contactEmail":"не-емейл"}"""
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect { status { isBadRequest() } }
    }

    // @trace FR-LOST-02
    @Test
    fun `lost requests filter by city and type`() {
        val token = register()
        createLost(token, city = "Київ", type = "person")
        createLost(token, city = "Львів", type = "place")

        mockMvc.get("/api/lost-requests?city=Київ").andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].city") { value("Київ") }
        }

        mockMvc.get("/api/lost-requests?type=place").andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].type") { value("place") }
        }
    }

    // @trace FR-ADMIN-01
    @Test
    fun `report is created by an authenticated user only`() {
        val author = register()
        val memoryId = createMemory(author)

        mockMvc.post("/api/reports") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"targetType":"memory","targetId":$memoryId,"reason":"Образливий вміст"}"""
        }.andExpect { status { isUnauthorized() } }

        val reporter = register(email = "reporter@example.com")
        mockMvc.post("/api/reports") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"targetType":"memory","targetId":$memoryId,"reason":"Образливий вміст"}"""
            header(HttpHeaders.AUTHORIZATION, bearer(reporter))
        }.andExpect {
            status { isCreated() }
            jsonPath("$.status") { value("ok") }
        }
    }

    private fun createLost(token: String, city: String, type: String) {
        mockMvc.post("/api/lost-requests") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"city":"$city","type":"$type","description":"Опис","contactEmail":"c@example.com"}"""
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect { status { isCreated() } }
    }
}
