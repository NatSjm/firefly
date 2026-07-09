package com.firefly.fireflybe.comments

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
class CommentController(private val commentService: CommentService) {

    @GetMapping
    fun getComments(
        @PathVariable memoryId: Long,
        authentication: Authentication?
    ): List<CommentDto> = commentService.list(memoryId, authentication?.principal as? User)

    @PostMapping
    fun addComment(
        @PathVariable memoryId: Long,
        @Valid @RequestBody req: CommentRequest,
        authentication: Authentication
    ): ResponseEntity<CommentDto> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(commentService.add(memoryId, authentication.principal as User, req))

    @DeleteMapping("/{commentId}")
    fun deleteComment(
        @PathVariable memoryId: Long,
        @PathVariable commentId: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        commentService.delete(memoryId, commentId, authentication.principal as User)
        return ResponseEntity.noContent().build()
    }
}
