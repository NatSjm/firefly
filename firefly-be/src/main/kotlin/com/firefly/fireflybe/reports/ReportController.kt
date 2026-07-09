package com.firefly.fireflybe.reports

import com.firefly.fireflybe.users.User
import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/reports")
class ReportController(private val reportService: ReportService) {

    @PostMapping
    fun createReport(
        @Valid @RequestBody req: ReportRequest,
        authentication: Authentication
    ): ResponseEntity<Map<String, String>> {
        reportService.create(authentication.principal as User, req)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("status" to "ok"))
    }
}

data class ReportRequest(
    @field:NotBlank
    @field:Size(max = 20)
    val targetType: String,
    @field:Min(1)
    val targetId: Long,
    @field:Size(max = 2_000)
    val reason: String? = null
)
