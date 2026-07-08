package com.firefly.fireflybe.integration

import com.firefly.fireflybe.users.UserRepository
import com.jayway.jsonpath.JsonPath
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.multipart
import org.springframework.test.web.servlet.post
import org.testcontainers.postgresql.PostgreSQLContainer
import java.nio.file.Files
import java.nio.file.Path

/**
 * Boots the full application (security filter chain, Flyway migrations, JPA)
 * against a throwaway PostgreSQL container shared by all integration tests.
 * Every test starts from an empty database.
 */
@SpringBootTest
@AutoConfigureMockMvc
abstract class IntegrationTestBase {

    @Autowired
    protected lateinit var mockMvc: MockMvc

    @Autowired
    protected lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    protected lateinit var userRepository: UserRepository

    @BeforeEach
    fun resetDatabase() {
        jdbcTemplate.execute(
            "TRUNCATE TABLE reports, likes, comments, media, memories, lost_requests, users RESTART IDENTITY CASCADE"
        )
    }

    protected fun bearer(token: String) = "Bearer $token"

    protected fun register(
        email: String = "user@example.com",
        password: String = "password123",
        name: String = "Оксана Тест"
    ): String {
        val result = mockMvc.post("/api/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$email","password":"$password","name":"$name"}"""
        }.andExpect { status { isCreated() } }.andReturn()
        return JsonPath.read(result.response.contentAsString, "$.token")
    }

    /** Registers a user, then promotes it to admin directly in the database. */
    protected fun registerAdmin(email: String = "admin@example.com"): String {
        val token = register(email = email, name = "Адмін Тест")
        val admin = userRepository.findByEmail(email).orElseThrow()
        admin.role = "admin"
        userRepository.save(admin)
        return token
    }

    protected fun userIdByEmail(email: String): Long =
        userRepository.findByEmail(email).orElseThrow().id

    protected fun createMemory(
        token: String,
        title: String = "Бабусин сад",
        text: String = "Пахло яблуками і дощем",
        type: String = "story",
        isPublic: Boolean = true,
        city: String? = null,
        topicSlug: String? = null,
        photo: MockMultipartFile? = null
    ): Long {
        val json = buildString {
            append("""{"type":"$type","title":"$title","text":"$text","isPublic":$isPublic""")
            if (city != null) append(""","city":"$city"""")
            if (topicSlug != null) append(""","topicSlug":"$topicSlug"""")
            append("}")
        }
        val result = mockMvc.multipart("/api/memories") {
            file(MockMultipartFile("data", "data", "application/json", json.toByteArray(Charsets.UTF_8)))
            if (photo != null) file(photo)
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect { status { isCreated() } }.andReturn()
        return JsonPath.read<Number>(result.response.contentAsString, "$.id").toLong()
    }

    protected fun likeMemory(token: String, memoryId: Long) {
        mockMvc.post("/api/likes") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"memoryId":$memoryId}"""
            header(HttpHeaders.AUTHORIZATION, bearer(token))
        }.andExpect { status { isOk() } }
    }

    companion object {
        private val postgres = PostgreSQLContainer("postgres:16-alpine").also { it.start() }

        val uploadDir: Path = Files.createTempDirectory("firefly-test-uploads")

        @JvmStatic
        @DynamicPropertySource
        fun registerProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl)
            registry.add("spring.datasource.username", postgres::getUsername)
            registry.add("spring.datasource.password", postgres::getPassword)
            registry.add("app.upload.dir") { uploadDir.toString() }
            // Integration tests legitimately register/login far more often per
            // minute than a real client — the auth rate limiter would otherwise
            // 429 them (see RateLimitFilter).
            registry.add("app.rate-limit.enabled") { "false" }
        }
    }
}
