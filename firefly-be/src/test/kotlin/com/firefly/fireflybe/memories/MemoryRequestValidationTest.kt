package com.firefly.fireflybe.memories

import jakarta.validation.Validation
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class MemoryRequestValidationTest {

    private val validator = Validation.buildDefaultValidatorFactory().validator

    // @trace FR-MEM-01
    @Test
    fun `valid story request passes`() {
        val violations = validator.validate(storyRequest())

        assertTrue(violations.isEmpty())
    }

    // @trace FR-MEM-01, FR-MEM-02
    @Test
    fun `valid recipe request with ingredients and steps passes`() {
        val violations = validator.validate(
            storyRequest().copy(
                type = "recipe",
                ingredients = "борошно, вода",
                steps = "змішати та випікати"
            )
        )

        assertTrue(violations.isEmpty())
    }

    // @trace FR-MEM-02
    @Test
    fun `blank title fails`() {
        assertEquals(setOf("title"), violationPaths(storyRequest().copy(title = " ")))
    }

    // @trace FR-MEM-02
    @Test
    fun `blank text fails`() {
        assertEquals(setOf("text"), violationPaths(storyRequest().copy(text = "")))
    }

    // @trace FR-MEM-01
    @Test
    fun `blank type fails`() {
        assertEquals(setOf("type"), violationPaths(storyRequest().copy(type = "")))
    }

    // @trace FR-MEM-02
    @Test
    fun `title longer than 255 chars fails`() {
        assertEquals(setOf("title"), violationPaths(storyRequest().copy(title = "т".repeat(256))))
    }

    // @trace FR-MEM-02
    @Test
    fun `year before 1900 fails`() {
        assertEquals(setOf("yearFrom"), violationPaths(storyRequest().copy(yearFrom = 1899)))
    }

    // @trace FR-MEM-02
    @Test
    fun `year after 2100 fails`() {
        assertEquals(setOf("yearTo"), violationPaths(storyRequest().copy(yearTo = 2101)))
    }

    // @trace FR-CITY-01
    @Test
    fun `city longer than 120 chars fails`() {
        assertEquals(setOf("city"), violationPaths(storyRequest().copy(city = "м".repeat(121))))
    }

    // @trace FR-TOPIC-02
    @Test
    fun `topic slug longer than 60 chars fails`() {
        assertEquals(setOf("topicSlug", "topicSlugAllowed"), violationPaths(storyRequest().copy(topicSlug = "т".repeat(61))))
    }

    // @trace FR-TOPIC-01
    @Test
    fun `topic slug outside the predefined list fails`() {
        assertEquals(setOf("topicSlugAllowed"), violationPaths(storyRequest().copy(topicSlug = "babusini-retsepty")))
    }

    // @trace FR-TOPIC-01
    @Test
    fun `blank topic slug passes since topic is optional`() {
        assertTrue(validator.validate(storyRequest().copy(topicSlug = null)).isEmpty())
    }

    private fun storyRequest() = MemoryRequest(
        type = "story",
        title = "Двір на Оболоні",
        text = "Ми грали у квача до темряви.",
        city = "Київ",
        topicSlug = "Дворові ігри",
        yearFrom = 1995,
        yearTo = 2001,
        isPublic = true
    )

    private fun violationPaths(request: MemoryRequest): Set<String> =
        validator.validate(request).map { it.propertyPath.toString() }.toSet()
}
