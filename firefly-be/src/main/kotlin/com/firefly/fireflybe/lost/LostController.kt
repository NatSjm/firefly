package com.firefly.fireflybe.lost

import com.firefly.fireflybe.users.User
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/lost-requests")
class LostController(private val lostRequestRepository: LostRequestRepository) {

    @GetMapping
    fun getAll(
        @RequestParam(required = false) city: String?,
        @RequestParam(required = false) type: String?
    ): List<LostRequestDto> {
        return lostRequestRepository.findByFilters(
            city?.trim()?.takeIf { it.isNotBlank() },
            type?.trim()?.takeIf { it.isNotBlank() }
        ).map { it.toDto() }
    }

    @PostMapping
    fun create(
        @Valid @RequestBody req: LostRequestRequest,
        authentication: Authentication
    ): ResponseEntity<LostRequestDto> {
        val user = authentication.principal as User
        val lostRequest = LostRequest(
            user = user,
            city = req.city.trim(),
            type = req.type.trim(),
            years = req.years?.trim()?.ifBlank { null },
            description = req.description.trim(),
            contactEmail = req.contactEmail.trim()
        )
        val saved = lostRequestRepository.save(lostRequest)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved.toDto())
    }

    @GetMapping("/{id}")
    fun getOne(@PathVariable id: Long): ResponseEntity<LostRequestDto> {
        val lostRequest = lostRequestRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(lostRequest.toDto())
    }
}
