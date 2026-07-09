package com.firefly.fireflybe.comments

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CommentDto(
    val id: Long,
    val memoryId: Long,
    val userId: Long,
    val authorName: String,
    val text: String,
    val createdAt: String
)

data class CommentRequest(
    @field:NotBlank
    @field:Size(max = 5_000)
    val text: String
)

fun Comment.toDto() = CommentDto(
    id = id,
    memoryId = memory.id,
    userId = user.id,
    authorName = user.name,
    text = text,
    createdAt = createdAt.toString()
)
