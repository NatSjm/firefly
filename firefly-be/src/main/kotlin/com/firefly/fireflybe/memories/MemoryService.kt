package com.firefly.fireflybe.memories

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.config.AppProperties
import com.firefly.fireflybe.likes.LikeRepository
import com.firefly.fireflybe.users.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.nio.file.Files
import java.nio.file.Paths
import java.util.UUID

@Service
class MemoryService(
    private val likeRepository: LikeRepository,
    private val commentRepository: CommentRepository,
    private val props: AppProperties
) {

    fun enrichDto(memory: Memory, currentUserId: Long? = null): MemoryDto {
        val likes = likeRepository.countByMemoryId(memory.id)
        val comments = commentRepository.countByMemoryId(memory.id)
        val likedByMe = currentUserId?.let { likeRepository.existsByUserIdAndMemoryId(it, memory.id) } ?: false
        return memory.toDto(likes, comments, likedByMe)
    }

    fun ensureViewAllowed(memory: Memory, currentUser: User?) {
        if (memory.isPublic) {
            return
        }
        val canView = currentUser != null && (currentUser.id == memory.user.id || currentUser.role == "admin")
        if (!canView) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
    }

    fun savePhoto(file: MultipartFile): String {
        val dir = Paths.get(props.uploadDir).toAbsolutePath().normalize()
        Files.createDirectories(dir)
        val ext = file.originalFilename?.substringAfterLast('.', "jpg")?.lowercase() ?: "jpg"
        val filename = "${UUID.randomUUID()}.$ext"
        file.transferTo(dir.resolve(filename))
        return "/uploads/$filename"
    }
}
