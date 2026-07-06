package com.firefly.fireflybe.auth

import com.firefly.fireflybe.config.AppProperties
import com.firefly.fireflybe.config.JwtService
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class JwtServiceTest {

    // @trace FR-AUTH-02
    @Test
    fun `generateToken produces a non blank token`() {
        val token = jwtService().generateToken(userId = 42, email = "user@example.com")

        assertTrue(token.isNotBlank())
    }

    // @trace FR-AUTH-02
    @Test
    fun `extractUserId round trips the user id`() {
        val token = jwtService().generateToken(userId = 42, email = "user@example.com")

        assertEquals(42, jwtService().extractUserId(token))
    }

    // @trace FR-AUTH-02
    @Test
    fun `extractEmail round trips the email`() {
        val token = jwtService().generateToken(userId = 42, email = "user@example.com")

        assertEquals("user@example.com", jwtService().extractEmail(token))
    }

    // @trace FR-AUTH-02
    @Test
    fun `isTokenValid returns true for a fresh token`() {
        val token = jwtService().generateToken(userId = 42, email = "user@example.com")

        assertTrue(jwtService().isTokenValid(token))
    }

    // @trace FR-AUTH-02
    @Test
    fun `isTokenValid returns false for an expired token`() {
        val service = jwtService(expirationMs = 1)
        val token = service.generateToken(userId = 42, email = "user@example.com")

        Thread.sleep(25)

        assertFalse(service.isTokenValid(token))
        assertEquals(null, service.extractUserId(token))
    }

    private fun jwtService(expirationMs: Long = 60_000): JwtService {
        val props = AppProperties()
        props.jwt.secret = "test-secret-key-with-at-least-thirty-two-characters"
        props.jwt.expirationMs = expirationMs
        assertNotNull(props.jwt.secret)
        return JwtService(props)
    }
}
