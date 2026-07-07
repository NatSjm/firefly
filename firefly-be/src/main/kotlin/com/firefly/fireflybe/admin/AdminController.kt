package com.firefly.fireflybe.admin

import com.firefly.fireflybe.users.User
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(private val adminService: AdminService) {

    @GetMapping("/reports")
    fun getReports(): List<AdminReportDto> = adminService.reports()

    @GetMapping("/users")
    fun getUsers(): List<AdminUserDto> = adminService.users()

    @DeleteMapping("/memories/{id}")
    fun deleteMemory(@PathVariable id: Long): ResponseEntity<Void> {
        adminService.deleteMemory(id)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/comments/{id}")
    fun deleteComment(@PathVariable id: Long): ResponseEntity<Void> {
        adminService.deleteComment(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/users/{id}/ban")
    fun banUser(@PathVariable id: Long, authentication: Authentication): Map<String, Boolean> =
        mapOf("banned" to adminService.toggleBan(id, authentication.principal as? User))
}
