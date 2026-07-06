package com.firefly.fireflybe.users

import jakarta.validation.constraints.Size

data class UserDto(
    val id: Long,
    val email: String,
    val name: String,
    val bio: String?,
    val avatarUrl: String?,
    val role: String,
    val createdAt: String
)

data class UpdateProfileRequest(
    @field:Size(min = 2, max = 120)
    val name: String?,
    @field:Size(max = 2_000)
    val bio: String?,
    @field:Size(max = 512)
    val avatarUrl: String?
)

fun User.toDto() = UserDto(
    id = id,
    email = email,
    name = name,
    bio = bio,
    avatarUrl = avatarUrl,
    role = role,
    createdAt = createdAt.toString()
)
