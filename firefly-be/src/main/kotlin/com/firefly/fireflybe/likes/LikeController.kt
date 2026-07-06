package com.firefly.fireflybe.likes

import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import jakarta.validation.constraints.NotNull
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/likes")
class LikeController(
    private val likeRepository: LikeRepository,
    private val memoryRepository: MemoryRepository,
    private val memoryService: MemoryService
) {

    @PostMapping
    fun toggleLike(
        @RequestBody req: LikeToggleRequest,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val user = authentication.principal as User
        val memory = memoryRepository.findById(req.memoryId).orElse(null)
            ?: return ResponseEntity.notFound().build()

        memoryService.ensureViewAllowed(memory, user)

        val existing = likeRepository.findByUserIdAndMemoryId(user.id, req.memoryId)
        if (existing != null) {
            likeRepository.delete(existing)
        } else {
            likeRepository.save(Like(user = user, memory = memory))
        }
        val count = likeRepository.countByMemoryId(req.memoryId)
        return ResponseEntity.ok(mapOf("liked" to (existing == null), "count" to count))
    }
}

data class LikeToggleRequest(@field:NotNull val memoryId: Long)
