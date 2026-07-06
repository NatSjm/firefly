package com.firefly.fireflybe.memories

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.config.AppProperties
import com.firefly.fireflybe.likes.LikeRepository
import com.firefly.fireflybe.users.User
import com.firefly.fireflybe.users.isAdmin
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths
import java.time.Instant
import java.util.UUID

@Service
class MemoryService(
    private val memoryRepository: MemoryRepository,
    private val likeRepository: LikeRepository,
    private val commentRepository: CommentRepository,
    private val props: AppProperties
) {

    private val logger = LoggerFactory.getLogger(MemoryService::class.java)

    companion object {
        private val ALLOWED_PHOTO_EXTENSIONS = setOf("jpg", "jpeg", "png", "gif", "webp")
    }

    fun listMine(user: User, type: String?, isPublic: Boolean?): List<MemoryDto> {
        val memories = when {
            isPublic != null -> memoryRepository.findByUserIdAndIsPublicOrderByCreatedAtDesc(user.id, isPublic)
            else -> memoryRepository.findByUserIdOrderByCreatedAtDesc(user.id)
        }
        return memories
            .filter { type == null || it.type == type }
            .map { enrichDto(it, user.id) }
    }

    @Transactional
    fun create(user: User, req: MemoryRequest, photo: MultipartFile?): MemoryDto {
        val memory = Memory(
            user = user,
            type = req.type.trim(),
            title = req.title.trim(),
            text = req.text.trim(),
            ingredients = req.ingredients?.trim()?.ifBlank { null },
            steps = req.steps?.trim()?.ifBlank { null },
            city = req.city?.trim()?.ifBlank { null },
            topicSlug = req.topicSlug?.trim()?.ifBlank { null },
            yearFrom = req.yearFrom,
            yearTo = req.yearTo,
            isPublic = req.isPublic
        )
        if (photo != null && !photo.isEmpty) {
            memory.media.add(Media(memory = memory, url = savePhoto(photo)))
        }
        return enrichDto(memoryRepository.save(memory), user.id)
    }

    fun getForView(id: Long, currentUser: User?): MemoryDto {
        val memory = findOrThrow(id)
        ensureViewAllowed(memory, currentUser)
        return enrichDto(memory, currentUser?.id)
    }

    @Transactional
    fun update(id: Long, user: User, req: MemoryRequest, photo: MultipartFile?): MemoryDto {
        val memory = findOrThrow(id)
        if (memory.user.id != user.id) {
            throw forbidden()
        }

        memory.type = req.type.trim()
        memory.title = req.title.trim()
        memory.text = req.text.trim()
        memory.ingredients = req.ingredients?.trim()?.ifBlank { null }
        memory.steps = req.steps?.trim()?.ifBlank { null }
        memory.city = req.city?.trim()?.ifBlank { null }
        memory.topicSlug = req.topicSlug?.trim()?.ifBlank { null }
        memory.yearFrom = req.yearFrom
        memory.yearTo = req.yearTo
        memory.isPublic = req.isPublic
        memory.updatedAt = Instant.now()

        if (photo != null && !photo.isEmpty) {
            val previousUrls = memory.media.map { it.url }
            memory.media.clear()
            memory.media.add(Media(memory = memory, url = savePhoto(photo)))
            deletePhotoFiles(previousUrls)
        }

        return enrichDto(memoryRepository.save(memory), user.id)
    }

    @Transactional
    fun delete(id: Long, user: User) {
        val memory = findOrThrow(id)
        if (memory.user.id != user.id && !user.isAdmin) {
            throw forbidden()
        }
        val photoUrls = memory.media.map { it.url }
        memoryRepository.delete(memory)
        deletePhotoFiles(photoUrls)
    }

    fun findOrThrow(id: Long): Memory =
        memoryRepository.findById(id)
            .orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Спогад не знайдено") }

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
        val canView = currentUser != null && (currentUser.id == memory.user.id || currentUser.isAdmin)
        if (!canView) {
            throw forbidden()
        }
    }

    fun savePhoto(file: MultipartFile): String {
        val dir = Paths.get(props.uploadDir).toAbsolutePath().normalize()
        Files.createDirectories(dir)
        val ext = file.originalFilename?.substringAfterLast('.', "jpg")?.lowercase() ?: "jpg"
        if (ext !in ALLOWED_PHOTO_EXTENSIONS) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Дозволені формати фото: JPG, PNG, GIF або WebP.")
        }
        val filename = "${UUID.randomUUID()}.$ext"
        file.transferTo(dir.resolve(filename))
        return "/uploads/$filename"
    }

    fun deletePhotoFiles(urls: List<String>) {
        val dir = Paths.get(props.uploadDir).toAbsolutePath().normalize()
        for (url in urls) {
            val filename = url.substringAfterLast('/')
            if (filename.isBlank()) {
                continue
            }
            val target = dir.resolve(filename).normalize()
            if (!target.startsWith(dir)) {
                continue
            }
            try {
                Files.deleteIfExists(target)
            } catch (e: IOException) {
                logger.warn("Failed to delete uploaded photo {}", target, e)
            }
        }
    }

    private fun forbidden() = ApiException(HttpStatus.FORBIDDEN, "Доступ заборонено")
}
