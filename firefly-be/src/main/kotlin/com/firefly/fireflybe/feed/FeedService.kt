package com.firefly.fireflybe.feed

import com.firefly.fireflybe.memories.MemoryDto
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service

data class FeedResponse(
    val items: List<MemoryDto>,
    val total: Long,
    val page: Int,
    val totalPages: Int
)

@Service
class FeedService(
    private val memoryRepository: MemoryRepository,
    private val memoryService: MemoryService
) {

    fun getFeed(
        city: String?,
        topic: String?,
        sort: String,
        page: Int,
        size: Int,
        currentUser: User?
    ): FeedResponse {
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
