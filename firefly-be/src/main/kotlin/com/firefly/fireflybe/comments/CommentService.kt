package com.firefly.fireflybe.comments

import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import com.firefly.fireflybe.users.isAdmin
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CommentService(
    private val commentRepository: CommentRepository,
    private val memoryService: MemoryService
) {

    fun list(memoryId: Long, currentUser: User?): List<CommentDto> {
        val memory = memoryService.findOrThrow(memoryId)
        memoryService.ensureViewAllowed(memory, currentUser)
        return commentRepository.findByMemoryIdOrderByCreatedAtAsc(memoryId).map { it.toDto() }
    }

    @Transactional
    fun add(memoryId: Long, user: User, req: CommentRequest): CommentDto {
        val memory = memoryService.findOrThrow(memoryId)
        memoryService.ensureViewAllowed(memory, user)
        return commentRepository.save(Comment(memory = memory, user = user, text = req.text.trim())).toDto()
    }

    @Transactional
    fun delete(memoryId: Long, commentId: Long, user: User) {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { notFound() }
        if (comment.memory.id != memoryId) {
            throw notFound()
        }
        if (comment.user.id != user.id && !user.isAdmin) {
            throw ApiException(HttpStatus.FORBIDDEN, "Доступ заборонено")
        }
        commentRepository.delete(comment)
    }

    private fun notFound() = ApiException(HttpStatus.NOT_FOUND, "Коментар не знайдено")
}
