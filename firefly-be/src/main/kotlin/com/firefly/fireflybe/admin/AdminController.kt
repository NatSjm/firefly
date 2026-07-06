package com.firefly.fireflybe.admin

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.reports.Report
import com.firefly.fireflybe.reports.ReportRepository
import com.firefly.fireflybe.users.User
import com.firefly.fireflybe.users.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(
    private val reportRepository: ReportRepository,
    private val memoryRepository: MemoryRepository,
    private val commentRepository: CommentRepository,
    private val userRepository: UserRepository
) {

    @GetMapping("/reports")
    fun getReports(): List<Report> = reportRepository.findAll()

    @DeleteMapping("/memories/{id}")
    fun deleteMemory(@PathVariable id: Long): ResponseEntity<Void> {
        if (!memoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }
        memoryRepository.deleteById(id)
        reportRepository.deleteAllByTargetTypeAndTargetId("memory", id)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/comments/{id}")
    fun deleteComment(@PathVariable id: Long): ResponseEntity<Void> {
        if (!commentRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }
        commentRepository.deleteById(id)
        reportRepository.deleteAllByTargetTypeAndTargetId("comment", id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/users/{id}/ban")
    fun banUser(@PathVariable id: Long, authentication: Authentication): ResponseEntity<Map<String, Any>> {
        val user = userRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val currentUser = authentication.principal as? User
        if (user.role.equals("admin", ignoreCase = true) || currentUser?.id == user.id) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("message" to "Неможливо заблокувати цей обліковий запис."))
        }
        user.isBanned = !user.isBanned
        user.updatedAt = Instant.now()
        userRepository.save(user)
        return ResponseEntity.ok(mapOf("banned" to user.isBanned))
    }

    @GetMapping("/users")
    fun getUsers() = userRepository.findAll().map {
        mapOf(
            "id" to it.id,
            "name" to it.name,
            "email" to it.email,
            "role" to it.role,
            "isBanned" to it.isBanned
        )
    }
}
