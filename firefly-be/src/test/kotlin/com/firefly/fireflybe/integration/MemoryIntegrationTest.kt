package com.firefly.fireflybe.integration

import com.jayway.jsonpath.JsonPath
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.multipart
import java.nio.file.Files
import kotlin.test.assertTrue

class MemoryIntegrationTest : IntegrationTestBase() {

    // @trace FR-MEM-01 FR-MEM-02
    @Test
    fun `create memory with photo stores the file and returns media url`() {
        val token = register()
        val photo = MockMultipartFile("photo", "садок.png", "image/png", byteArrayOf(1, 2, 3, 4))

        val json = """{"type":"recipe","title":"Вареники з вишнями","text":"Рецепт із зошита",""" +
            """"ingredients":"вишні, тісто","steps":"ліпити і варити","isPublic":true}"""
        val result = mockMvc.multipart("/api/memories") {
            file(MockMultipartFile("data", "data", "application/json", json.toByteArray()))
            file(photo)
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect {
            status { isCreated() }
            jsonPath("$.title") { value("Вареники з вишнями") }
            jsonPath("$.type") { value("recipe") }
            jsonPath("$.ingredients") { value("вишні, тісто") }
            jsonPath("$.mediaUrls.length()") { value(1) }
        }.andReturn()

        val url = JsonPath.read<String>(result.response.contentAsString, "$.mediaUrls[0]")
        val stored = uploadDir.resolve(url.removePrefix("/uploads/"))
        assertTrue(Files.exists(stored), "uploaded photo should exist at $stored")
    }

    // @trace FR-MEM-01
    @Test
    fun `create memory with blank title is rejected`() {
        val token = register()
        val json = """{"type":"story","title":"  ","text":"Текст","isPublic":true}"""
        mockMvc.multipart("/api/memories") {
            file(MockMultipartFile("data", "data", "application/json", json.toByteArray()))
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect { status { isBadRequest() } }
    }

    // @trace FR-MEM-04
    @Test
    fun `my memories lists only own memories with visibility and type filters`() {
        val mine = register(email = "mine@example.com")
        val other = register(email = "other@example.com")
        val publicStory = createMemory(mine, title = "Публічна", isPublic = true)
        val privateRecipe = createMemory(mine, title = "Приватна", type = "recipe", isPublic = false)
        createMemory(other, title = "Чужа", isPublic = true)

        mockMvc.get("/api/memories") {
            header(HttpHeaders.AUTHORIZATION, bearer(mine))
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(2) }
        }

        mockMvc.get("/api/memories?isPublic=false") {
            header(HttpHeaders.AUTHORIZATION, bearer(mine))
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].id") { value(privateRecipe.toInt()) }
        }

        mockMvc.get("/api/memories?type=story") {
            header(HttpHeaders.AUTHORIZATION, bearer(mine))
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].id") { value(publicStory.toInt()) }
        }
    }

    // @trace FR-MEM-03 FR-MEM-06
    @Test
    fun `private memory is visible to owner and admin but forbidden to others`() {
        val owner = register(email = "owner@example.com")
        val stranger = register(email = "stranger@example.com")
        val admin = registerAdmin()
        val memoryId = createMemory(owner, title = "Приватний спогад", isPublic = false)

        mockMvc.get("/api/memories/$memoryId") {
            header(HttpHeaders.AUTHORIZATION, bearer(owner))
        }.andExpect { status { isOk() } }

        mockMvc.get("/api/memories/$memoryId") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect { status { isOk() } }

        mockMvc.get("/api/memories/$memoryId") {
            header(HttpHeaders.AUTHORIZATION, bearer(stranger))
        }.andExpect { status { isForbidden() } }

        mockMvc.get("/api/memories/$memoryId")
            .andExpect { status { isForbidden() } }
    }

    // @trace FR-MEM-03
    @Test
    fun `public memory is visible anonymously`() {
        val owner = register()
        val memoryId = createMemory(owner, title = "Для всіх", isPublic = true)

        mockMvc.get("/api/memories/$memoryId").andExpect {
            status { isOk() }
            jsonPath("$.title") { value("Для всіх") }
            jsonPath("$.authorName") { value("Оксана Тест") }
        }
    }

    // @trace FR-MEM-05
    @Test
    fun `owner can update a memory, others cannot`() {
        val owner = register(email = "owner@example.com")
        val stranger = register(email = "stranger@example.com")
        val memoryId = createMemory(owner, title = "Стара назва")

        val update = """{"type":"story","title":"Нова назва","text":"Оновлений текст","isPublic":false}"""

        mockMvc.multipart(HttpMethod.PUT, "/api/memories/$memoryId") {
            file(MockMultipartFile("data", "data", "application/json", update.toByteArray()))
            header(HttpHeaders.AUTHORIZATION, bearer(stranger))
        }.andExpect { status { isForbidden() } }

        mockMvc.multipart(HttpMethod.PUT, "/api/memories/$memoryId") {
            file(MockMultipartFile("data", "data", "application/json", update.toByteArray()))
            header(HttpHeaders.AUTHORIZATION, bearer(owner))
        }.andExpect {
            status { isOk() }
            jsonPath("$.title") { value("Нова назва") }
            jsonPath("$.isPublic") { value(false) }
            jsonPath("$.updatedAt") { isNotEmpty() }
        }
    }

    // @trace FR-MEM-05
    @Test
    fun `replacing the photo deletes the previous file`() {
        val owner = register()
        val first = MockMultipartFile("photo", "перше.png", "image/png", byteArrayOf(1))
        val memoryId = createMemory(owner, photo = first)
        val firstUrl = JsonPath.read<String>(
            mockMvc.get("/api/memories/$memoryId") {
                header(HttpHeaders.AUTHORIZATION, bearer(owner))
            }.andReturn().response.contentAsString,
            "$.mediaUrls[0]"
        )
        val firstFile = uploadDir.resolve(firstUrl.removePrefix("/uploads/"))
        assertTrue(Files.exists(firstFile))

        val update = """{"type":"story","title":"Бабусин сад","text":"Пахло яблуками","isPublic":true}"""
        mockMvc.multipart(HttpMethod.PUT, "/api/memories/$memoryId") {
            file(MockMultipartFile("data", "data", "application/json", update.toByteArray()))
            file(MockMultipartFile("photo", "друге.png", "image/png", byteArrayOf(2)))
            header(HttpHeaders.AUTHORIZATION, bearer(owner))
        }.andExpect {
            status { isOk() }
            jsonPath("$.mediaUrls.length()") { value(1) }
        }

        assertTrue(Files.notExists(firstFile), "previous photo should be deleted")
    }

    // @trace FR-MEM-05 FR-ADMIN-02
    @Test
    fun `owner or admin can delete a memory, others cannot`() {
        val owner = register(email = "owner@example.com")
        val stranger = register(email = "stranger@example.com")
        val admin = registerAdmin()

        val ownDelete = createMemory(owner, title = "Видалити самому")
        val adminDelete = createMemory(owner, title = "Видалить адмін")

        mockMvc.delete("/api/memories/$ownDelete") {
            header(HttpHeaders.AUTHORIZATION, bearer(stranger))
        }.andExpect { status { isForbidden() } }

        mockMvc.delete("/api/memories/$ownDelete") {
            header(HttpHeaders.AUTHORIZATION, bearer(owner))
        }.andExpect { status { isNoContent() } }

        mockMvc.get("/api/memories/$ownDelete").andExpect { status { isNotFound() } }

        mockMvc.delete("/api/memories/$adminDelete") {
            header(HttpHeaders.AUTHORIZATION, bearer(admin))
        }.andExpect { status { isNoContent() } }
    }

    // @trace FR-MEM-01
    @Test
    fun `creating a memory requires authentication`() {
        val json = """{"type":"story","title":"Анонім","text":"Текст","isPublic":true}"""
        mockMvc.multipart("/api/memories") {
            file(MockMultipartFile("data", "data", "application/json", json.toByteArray()))
        }.andExpect { status { isUnauthorized() } }
    }
}
