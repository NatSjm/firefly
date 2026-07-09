package com.firefly.fireflybe.reports

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.users.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ReportService(
    private val reportRepository: ReportRepository,
    private val memoryRepository: MemoryRepository,
    private val commentRepository: CommentRepository
) {

    companion object {
        private val ALLOWED_TARGET_TYPES = setOf("memory", "comment")
    }

    @Transactional
    fun create(user: User, req: ReportRequest) {
        val targetType = req.targetType.trim()
        if (targetType !in ALLOWED_TARGET_TYPES) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Невідомий тип цілі скарги.")
        }
        val targetExists = when (targetType) {
            "memory" -> memoryRepository.existsById(req.targetId)
            "comment" -> commentRepository.existsById(req.targetId)
            else -> false
        }
        if (!targetExists) {
            throw ApiException(HttpStatus.NOT_FOUND, "Об'єкт скарги не знайдено.")
        }
        reportRepository.save(
            Report(
                targetType = targetType,
                targetId = req.targetId,
                reporterId = user.id,
                reason = req.reason?.trim()?.ifBlank { null }
            )
        )
    }
}
