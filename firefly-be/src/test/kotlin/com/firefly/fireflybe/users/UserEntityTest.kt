package com.firefly.fireflybe.users

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse

class UserEntityTest {

    // @trace FR-AUTH-01
    @Test
    fun `new user has role user by default`() {
        assertEquals("user", User().role)
    }

    // @trace FR-MOD-03
    @Test
    fun `new user has isBanned false by default`() {
        assertFalse(User().isBanned)
    }
}
