package com.firefly.fireflybe.auth

import jakarta.validation.Validation
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class RegisterRequestValidationTest {

    private val validator = Validation.buildDefaultValidatorFactory().validator

    // @trace FR-AUTH-01
    @Test
    fun `valid request passes`() {
        val violations = validator.validate(
            RegisterRequest(
                email = "user@example.com",
                password = "password123",
                name = "Іванка"
            )
        )

        assertTrue(violations.isEmpty())
    }

    // @trace FR-AUTH-01
    @Test
    fun `blank email fails`() {
        assertEquals(setOf("email"), violationPaths(RegisterRequest("", "password123", "Іванка")))
    }

    // @trace FR-AUTH-01
    @Test
    fun `invalid email format fails`() {
        assertEquals(setOf("email"), violationPaths(RegisterRequest("not-an-email", "password123", "Іванка")))
    }

    // @trace FR-AUTH-01
    @Test
    fun `password shorter than eight chars fails`() {
        assertEquals(setOf("password"), violationPaths(RegisterRequest("user@example.com", "short", "Іванка")))
    }

    // @trace FR-AUTH-01
    @Test
    fun `blank name fails`() {
        assertEquals(setOf("name"), violationPaths(RegisterRequest("user@example.com", "password123", "")))
    }

    private fun violationPaths(request: RegisterRequest): Set<String> =
        validator.validate(request).map { it.propertyPath.toString() }.toSet()
}
