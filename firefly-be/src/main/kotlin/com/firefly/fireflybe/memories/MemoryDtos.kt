package com.firefly.fireflybe.memories

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class MemoryRequest(
    @field:NotBlank
    @field:Size(max = 20)
    val type: String,
    @field:NotBlank(message = "Назва обов'язкова")
    @field:Size(max = 255, message = "Назва не може перевищувати 255 символів")
    val title: String,
    @field:NotBlank
    @field:Size(max = 20000, message = "Текст не може перевищувати 20000 символів")
    val text: String,
    @field:Size(max = 20000, message = "Інгредієнти не можуть перевищувати 20000 символів")
    val ingredients: String? = null,
    @field:Size(max = 20000, message = "Кроки не можуть перевищувати 20000 символів")
    val steps: String? = null,
    @field:Size(max = 120)
    val city: String? = null,
    @field:Size(max = 60)
    val topicSlug: String? = null,
    @field:Min(1900)
    @field:Max(2100)
    val yearFrom: Int? = null,
    @field:Min(1900)
    @field:Max(2100)
    val yearTo: Int? = null,
    val isPublic: Boolean = false
)

data class MemoryDto(
    val id: Long,
    val userId: Long,
    val authorName: String,
    val type: String,
    val title: String,
    val text: String,
    val ingredients: String?,
    val steps: String?,
    val city: String?,
    val topicSlug: String?,
    val yearFrom: Int?,
    val yearTo: Int?,
    val isPublic: Boolean,
    val createdAt: String,
    val updatedAt: String?,
    val mediaUrls: List<String>,
    val likesCount: Long,
    val commentsCount: Long,
    val likedByMe: Boolean = false
)

fun Memory.toDto(likesCount: Long = 0, commentsCount: Long = 0, likedByMe: Boolean = false) = MemoryDto(
    id = id,
    userId = user.id,
    authorName = user.name,
    type = type,
    title = title,
    text = text,
    ingredients = ingredients,
    steps = steps,
    city = city,
    topicSlug = topicSlug,
    yearFrom = yearFrom,
    yearTo = yearTo,
    isPublic = isPublic,
    createdAt = createdAt.toString(),
    updatedAt = updatedAt?.toString(),
    mediaUrls = media.map { it.url },
    likesCount = likesCount,
    commentsCount = commentsCount,
    likedByMe = likedByMe
)
