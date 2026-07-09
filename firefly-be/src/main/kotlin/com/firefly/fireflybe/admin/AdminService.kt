package com.firefly.fireflybe.admin

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.reports.ReportRepository
import com.firefly.fireflybe.users.User
import com.firefly.fireflybe.users.UserRepository
import com.firefly.fireflybe.users.isAdmin
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

data class AdminReportDto(
    val id: Long,
    val targetType: String,
    val targetId: Long,
    val reason: String?,
    val createdAt: Instant,
    val reporterId: Long?
)

data class AdminUserDto(
    val id: Long,
    val name: String,
    val email: String,
    val role: String,
    val isBanned: Boolean
)

@Service
class AdminService(
    private val reportRepository: ReportRepository,
    private val memoryRepository: MemoryRepository,
    private val commentRepository: CommentRepository,
    private val userRepository: UserRepository,
    private val memoryService: MemoryService
) {

    fun reports(): List<AdminReportDto> = reportRepository.findAll().map { r ->
        AdminReportDto(
            id = r.id,
            targetType = r.targetType,
            targetId = r.targetId,
            reason = r.reason,
            createdAt = r.createdAt,
            reporterId = r.reporterId
        )
    }

    fun users(): List<AdminUserDto> = userRepository.findAll().map {
        AdminUserDto(id = it.id, name = it.name, email = it.email, role = it.role, isBanned = it.isBanned)
    }

    @Transactional
    fun deleteMemory(id: Long) {
        val memory = memoryRepository.findById(id)
            .orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Спогад не знайдено") }
        val photoUrls = memory.media.map { it.url }
        memoryRepository.delete(memory)
        reportRepository.deleteAllByTargetTypeAndTargetId("memory", id)
        memoryService.deletePhotoFiles(photoUrls)
    }

    @Transactional
    fun deleteComment(id: Long) {
        if (!commentRepository.existsById(id)) {
            throw ApiException(HttpStatus.NOT_FOUND, "Коментар не знайдено")
        }
        commentRepository.deleteById(id)
        reportRepository.deleteAllByTargetTypeAndTargetId("comment", id)
    }

    @Transactional
    fun toggleBan(id: Long, currentUser: User?): Boolean {
        val user = userRepository.findById(id)
            .orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено") }
        if (user.isAdmin || currentUser?.id == user.id) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Неможливо заблокувати цей обліковий запис.")
        }
        user.isBanned = !user.isBanned
        user.updatedAt = Instant.now()
        userRepository.save(user)
        return user.isBanned
    }
}
