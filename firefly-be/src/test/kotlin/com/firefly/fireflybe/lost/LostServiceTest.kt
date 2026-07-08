package com.firefly.fireflybe.lost

import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.users.User
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import java.lang.reflect.Proxy
import java.time.Instant
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

// @trace FR-LOST-01, FR-LOST-02, FR-LOST-03, FR-LOST-04, FR-LOST-05

class LostServiceTest {

    private val repo = RecordingLostRequestRepository()
    private val service = LostService(repo.proxy)

    private fun user(id: Long = 1L, name: String = "Автор") =
        User(id = id, name = name, email = "user$id@t.com", passwordHash = "x")

    private fun lostRequest(
        id: Long = 1L,
        owner: User = user(),
        city: String = "Маріуполь",
        type: String = "school",
        years: String? = "1998-2003",
        description: String = "Шукаю однокласників",
        contactEmail: String = "author@t.com",
        createdAt: Instant = Instant.parse("2024-01-01T00:00:00Z")
    ) = LostRequest(
        id = id,
        user = owner,
        city = city,
        type = type,
        years = years,
        description = description,
        contactEmail = contactEmail,
        createdAt = createdAt
    )

    // @trace FR-LOST-02
    @Test
    fun `create trims fields, coerces blank years to null, and returns the authored dto`() {
        val author = user(id = 7L, name = "Оля")
        val req = LostRequestRequest(
            city = "  Київ  ",
            type = "  camp  ",
            years = "   ",
            description = "  Шукаю друзів з табору  ",
            contactEmail = "  olya@example.com  "
        )
        repo.saveResult = lostRequest(
            id = 42L,
            owner = author,
            city = "Київ",
            type = "camp",
            years = null,
            description = "Шукаю друзів з табору",
            contactEmail = "olya@example.com"
        )

        val dto = service.create(author, req)

        val saved = repo.savedRequest
        checkNotNull(saved)
        assertEquals("Київ", saved.city)
        assertEquals("camp", saved.type)
        assertNull(saved.years)
        assertEquals("Шукаю друзів з табору", saved.description)
        assertEquals("olya@example.com", saved.contactEmail)
        assertEquals(author, saved.user)

        assertEquals(42L, dto.id)
        assertEquals(7L, dto.userId)
        assertEquals("Оля", dto.authorName)
        assertEquals("Київ", dto.city)
        assertEquals("olya@example.com", dto.contactEmail)
    }

    // @trace FR-LOST-02
    @Test
    fun `create preserves a non-blank trimmed years value`() {
        val author = user()
        val req = LostRequestRequest(
            city = "Одеса",
            type = "school",
            years = "  1995-2000  ",
            description = "Опис",
            contactEmail = "a@t.com"
        )
        repo.saveResult = lostRequest(years = "1995-2000")

        service.create(author, req)

        assertEquals("1995-2000", repo.savedRequest?.years)
    }

    // @trace FR-LOST-02
    @Test
    fun `create rejects a backwards year range with a 400 ApiException`() {
        val author = user()
        val req = LostRequestRequest(
            city = "Київ",
            type = "school",
            years = "2025-1990",
            description = "Опис",
            contactEmail = "a@t.com"
        )

        val exception = assertThrows<ApiException> {
            service.create(author, req)
        }

        assertEquals(HttpStatus.BAD_REQUEST, exception.status)
        assertTrue(exception.message.isNotBlank())
    }

    // @trace FR-LOST-02
    @Test
    fun `create accepts a forward year range and non-numeric years text unchanged`() {
        val author = user()
        repo.saveResult = lostRequest(years = "1998-2003")

        service.create(author, LostRequestRequest("Київ", "school", "1998-2003", "Опис", "a@t.com"))
        assertEquals("1998-2003", repo.savedRequest?.years)

        repo.saveResult = lostRequest(years = "приблизно 1999")
        service.create(author, LostRequestRequest("Київ", "school", "приблизно 1999", "Опис", "a@t.com"))
        assertEquals("приблизно 1999", repo.savedRequest?.years)
    }

    // @trace FR-LOST-01, FR-LOST-03
    @Test
    fun `list with no filters returns all requests ordered newest-first`() {
        val newer = lostRequest(id = 2L, createdAt = Instant.parse("2024-02-01T00:00:00Z"))
        val older = lostRequest(id = 1L, createdAt = Instant.parse("2024-01-01T00:00:00Z"))
        repo.findByFiltersResult = listOf(newer, older)

        val result = service.list(null, null)

        assertEquals(null, repo.lastCity)
        assertEquals(null, repo.lastType)
        assertEquals(2, result.size)
        assertEquals(2L, result[0].id)
        assertEquals(1L, result[1].id)
    }

    // @trace FR-LOST-03
    @Test
    fun `list filtered by city narrows results to matching city`() {
        repo.findByFiltersResult = listOf(lostRequest(city = "Маріуполь"))

        val result = service.list("Маріуполь", null)

        assertEquals("Маріуполь", repo.lastCity)
        assertEquals(null, repo.lastType)
        assertEquals(1, result.size)
        assertEquals("Маріуполь", result[0].city)
    }

    // @trace FR-LOST-03
    @Test
    fun `list filtered by type narrows results to matching type`() {
        repo.findByFiltersResult = listOf(lostRequest(type = "school"))

        val result = service.list(null, "school")

        assertEquals(null, repo.lastCity)
        assertEquals("school", repo.lastType)
        assertEquals(1, result.size)
        assertEquals("school", result[0].type)
    }

    // @trace FR-LOST-03
    @Test
    fun `list normalizes blank and whitespace-only filters to null`() {
        repo.findByFiltersResult = emptyList()

        service.list("   ", "")

        assertEquals(null, repo.lastCity)
        assertEquals(null, repo.lastType)
    }

    // @trace FR-LOST-05
    @Test
    fun `get returns the dto for an existing id`() {
        repo.findByIdResult = lostRequest(id = 5L, city = "Харків")

        val dto = service.get(5L)

        assertEquals(5L, dto.id)
        assertEquals("Харків", dto.city)
    }

    // @trace FR-LOST-05
    @Test
    fun `get throws 404 ApiException for a non-existent id`() {
        repo.findByIdResult = null

        val exception = assertThrows<ApiException> {
            service.get(999L)
        }

        assertEquals(HttpStatus.NOT_FOUND, exception.status)
        assertTrue(exception.message.isNotBlank())
    }

    private class RecordingLostRequestRepository {
        var saveResult: LostRequest? = null
        var savedRequest: LostRequest? = null
        var findByFiltersResult: List<LostRequest> = emptyList()
        var findByIdResult: LostRequest? = null
        var lastCity: String? = null
        var lastType: String? = null

        val proxy: LostRequestRepository =
            Proxy.newProxyInstance(
                LostRequestRepository::class.java.classLoader,
                arrayOf(LostRequestRepository::class.java)
            ) { _, method, args ->
                when (method.name) {
                    "findByFilters" -> {
                        lastCity = args?.get(0) as String?
                        lastType = args?.get(1) as String?
                        findByFiltersResult
                    }
                    "save" -> {
                        savedRequest = args?.get(0) as LostRequest
                        saveResult ?: savedRequest
                    }
                    "findById" -> Optional.ofNullable(findByIdResult)
                    "equals" -> false
                    "hashCode" -> System.identityHashCode(this)
                    "toString" -> "RecordingLostRequestRepository"
                    else -> throw UnsupportedOperationException("unexpected call: ${method.name}")
                }
            } as LostRequestRepository
    }
}
