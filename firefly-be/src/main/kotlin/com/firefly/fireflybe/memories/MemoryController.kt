package com.firefly.fireflybe.memories

import com.firefly.fireflybe.users.User
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/memories")
class MemoryController(private val memoryService: MemoryService) {

    @GetMapping
    fun getMyMemories(
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) isPublic: Boolean?,
        authentication: Authentication
    ): List<MemoryDto> = memoryService.listMine(authentication.principal as User, type, isPublic)

    @PostMapping
    fun createMemory(
        @Valid @RequestPart("data") req: MemoryRequest,
        @RequestPart(value = "photo", required = false) photo: MultipartFile?,
        authentication: Authentication
    ): ResponseEntity<MemoryDto> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(memoryService.create(authentication.principal as User, req, photo))

    @GetMapping("/{id}")
    fun getMemory(@PathVariable id: Long, authentication: Authentication?): MemoryDto =
        memoryService.getForView(id, authentication?.principal as? User)

    @PutMapping("/{id}")
    fun updateMemory(
        @PathVariable id: Long,
        @Valid @RequestPart("data") req: MemoryRequest,
        @RequestPart(value = "photo", required = false) photo: MultipartFile?,
        authentication: Authentication
    ): MemoryDto = memoryService.update(id, authentication.principal as User, req, photo)

    @DeleteMapping("/{id}")
    fun deleteMemory(@PathVariable id: Long, authentication: Authentication): ResponseEntity<Void> {
        memoryService.delete(id, authentication.principal as User)
        return ResponseEntity.noContent().build()
    }
}
