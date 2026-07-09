package com.firefly.fireflybe.users

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class UserService(private val userRepository: UserRepository) {

    @Transactional
    fun updateProfile(user: User, req: UpdateProfileRequest): UserDto {
        req.name?.trim()?.takeIf { it.isNotBlank() }?.let { user.name = it }
        req.bio?.trim()?.let { user.bio = it.ifBlank { null } }
        req.avatarUrl?.trim()?.let { user.avatarUrl = it.ifBlank { null } }
        user.updatedAt = Instant.now()
        return userRepository.save(user).toDto()
    }
}
