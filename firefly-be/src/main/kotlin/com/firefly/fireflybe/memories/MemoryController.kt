package com.firefly.fireflybe.memories

import com.firefly.fireflybe.users.User
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.time.Instant

@RestController
@RequestMapping("/api/memories")
class MemoryController(
    private val memoryRepository: MemoryRepository,
    private val mediaRepository: MediaRepository,
    private val memoryService: MemoryService
) {

    @GetMapping
    fun getMyMemories(
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) isPublic: Boolean?,
        authentication: Authentication
    ): List<MemoryDto> {
        val user = authentication.principal as User
        val memories = when {
            isPublic != null -> memoryRepository.findByUserIdAndIsPublicOrderByCreatedAtDesc(user.id, isPublic)
            else -> memoryRepository.findByUserIdOrderByCreatedAtDesc(user.id)
        }
        return memories
            .filter { type == null || it.type == type }
            .map { memoryService.enrichDto(it, user.id) }
    }

    @PostMapping
    fun createMemory(
        @Valid @RequestPart("data") req: MemoryRequest,
        @RequestPart(value = "photo", required = false) photo: MultipartFile?,
        authentication: Authentication
    ): ResponseEntity<MemoryDto> {
        val user = authentication.principal as User
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
        val saved = memoryRepository.save(memory)
        if (photo != null && !photo.isEmpty) {
            mediaRepository.save(Media(memory = saved, url = memoryService.savePhoto(photo)))
        }
        val fresh = memoryRepository.findById(saved.id).orElseThrow()
        return ResponseEntity.status(HttpStatus.CREATED).body(memoryService.enrichDto(fresh, user.id))
    }

    @GetMapping("/{id}")
    fun getMemory(@PathVariable id: Long, authentication: Authentication?): ResponseEntity<MemoryDto> {
        val memory = memoryRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val currentUser = authentication?.principal as? User
        if (!memory.isPublic && (currentUser == null || (currentUser.id != memory.user.id && currentUser.role != "admin"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        return ResponseEntity.ok(memoryService.enrichDto(memory, currentUser?.id))
    }

    @PutMapping("/{id}")
    fun updateMemory(
        @PathVariable id: Long,
        @Valid @RequestPart("data") req: MemoryRequest,
        @RequestPart(value = "photo", required = false) photo: MultipartFile?,
        authentication: Authentication
    ): ResponseEntity<MemoryDto> {
        val user = authentication.principal as User
        val memory = memoryRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (memory.user.id != user.id) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
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
            mediaRepository.deleteByMemoryId(memory.id)
            mediaRepository.save(Media(memory = memory, url = memoryService.savePhoto(photo)))
        }

        val saved = memoryRepository.save(memory)
        val fresh = memoryRepository.findById(saved.id).orElseThrow()
        return ResponseEntity.ok(memoryService.enrichDto(fresh, user.id))
    }

    @DeleteMapping("/{id}")
    fun deleteMemory(@PathVariable id: Long, authentication: Authentication): ResponseEntity<Void> {
        val user = authentication.principal as User
        val memory = memoryRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (memory.user.id != user.id && user.role != "admin") {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        memoryRepository.delete(memory)
        return ResponseEntity.noContent().build()
    }
}
