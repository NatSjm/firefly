package com.firefly.fireflybe.feed

import com.firefly.fireflybe.memories.MemoryDto
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import org.springframework.data.domain.PageRequest
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/feed")
class FeedController(
    private val memoryRepository: MemoryRepository,
    private val memoryService: MemoryService
) {

    @GetMapping
    fun getFeed(
        @RequestParam(required = false) city: String?,
        @RequestParam(required = false) topic: String?,
        @RequestParam(defaultValue = "new") sort: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication?
    ): FeedResponse {
        val currentUser = authentication?.principal as? User
        val pageable = PageRequest.of(page, size)
        val cityFilter = city?.trim()?.takeIf { it.isNotBlank() }
        val topicFilter = topic?.trim()?.takeIf { it.isNotBlank() }

        val memories = if (sort == "popular") {
            memoryRepository.findPublicByFiltersOrderByPopularity(cityFilter, topicFilter, pageable)
        } else {
            memoryRepository.findPublicByFilters(cityFilter, topicFilter, pageable)
        }

        return FeedResponse(
            items = memories.content.map { memoryService.enrichDto(it, currentUser?.id) },
            total = memories.totalElements,
            page = memories.number,
            totalPages = memories.totalPages
        )
    }
}

data class FeedResponse(
    val items: List<MemoryDto>,
    val total: Long,
    val page: Int,
    val totalPages: Int
)
