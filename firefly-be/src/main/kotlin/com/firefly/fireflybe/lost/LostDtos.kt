package com.firefly.fireflybe.lost

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LostRequestDto(
    val id: Long,
    val userId: Long,
    val authorName: String,
    val city: String,
    val type: String,
    val years: String?,
    val description: String,
    val contactEmail: String,
    val createdAt: String
)

data class LostRequestRequest(
    @field:NotBlank
    @field:Size(max = 120)
    val city: String,
    @field:NotBlank
    @field:Size(max = 30)
    val type: String,
    @field:Size(max = 50)
    val years: String? = null,
    @field:NotBlank
    val description: String,
    @field:Email
    @field:NotBlank
    val contactEmail: String
)

fun LostRequest.toDto() = LostRequestDto(
    id = id,
    userId = user.id,
    authorName = user.name,
    city = city,
    type = type,
    years = years,
    description = description,
    contactEmail = contactEmail,
    createdAt = createdAt.toString()
)
