package com.firefly.fireflybe.comments

import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/memories/{memoryId}/comments")
class CommentController(
    private val commentRepository: CommentRepository,
    private val memoryRepository: MemoryRepository,
    private val memoryService: MemoryService
) {

    @GetMapping
    fun getComments(
        @PathVariable memoryId: Long,
        authentication: Authentication?
    ): ResponseEntity<List<CommentDto>> {
        val memory = memoryRepository.findById(memoryId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val currentUser = authentication?.principal as? User
        if (!memory.isPublic && (currentUser == null || (currentUser.id != memory.user.id && currentUser.role != "admin"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        return ResponseEntity.ok(commentRepository.findByMemoryIdOrderByCreatedAtAsc(memoryId).map { it.toDto() })
    }

    @PostMapping
    fun addComment(
        @PathVariable memoryId: Long,
        @Valid @RequestBody req: CommentRequest,
        authentication: Authentication
    ): ResponseEntity<CommentDto> {
        val user = authentication.principal as User
        val memory = memoryRepository.findById(memoryId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        memoryService.ensureViewAllowed(memory, user)
        val comment = Comment(memory = memory, user = user, text = req.text.trim())
        val saved = commentRepository.save(comment)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved.toDto())
    }

    @DeleteMapping("/{commentId}")
    fun deleteComment(
        @PathVariable memoryId: Long,
        @PathVariable commentId: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val user = authentication.principal as User
        val comment = commentRepository.findById(commentId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (comment.memory.id != memoryId) {
            return ResponseEntity.notFound().build()
        }
        if (comment.user.id != user.id && user.role != "admin") {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        commentRepository.delete(comment)
        return ResponseEntity.noContent().build()
    }
}
