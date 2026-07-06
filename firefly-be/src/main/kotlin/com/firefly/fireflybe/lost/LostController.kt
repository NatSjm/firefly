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
class LostController(private val lostService: LostService) {

    @GetMapping
    fun getAll(
        @RequestParam(required = false) city: String?,
        @RequestParam(required = false) type: String?
    ): List<LostRequestDto> = lostService.list(city, type)

    @PostMapping
    fun create(
        @Valid @RequestBody req: LostRequestRequest,
        authentication: Authentication
    ): ResponseEntity<LostRequestDto> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(lostService.create(authentication.principal as User, req))

    @GetMapping("/{id}")
    fun getOne(@PathVariable id: Long): LostRequestDto = lostService.get(id)
}
