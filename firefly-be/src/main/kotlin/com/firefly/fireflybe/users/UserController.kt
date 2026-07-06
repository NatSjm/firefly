package com.firefly.fireflybe.users

import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

@RestController
@RequestMapping("/api/users")
class UserController(private val userRepository: UserRepository) {

    @PutMapping("/me")
    fun updateProfile(
        @Valid @RequestBody req: UpdateProfileRequest,
        authentication: Authentication
    ): ResponseEntity<UserDto> {
        val user = authentication.principal as User
        req.name?.trim()?.takeIf { it.isNotBlank() }?.let { user.name = it }
        req.bio?.trim()?.let { user.bio = it.ifBlank { null } }
        req.avatarUrl?.trim()?.let { user.avatarUrl = it.ifBlank { null } }
        user.updatedAt = Instant.now()
        return ResponseEntity.ok(userRepository.save(user).toDto())
    }
}
