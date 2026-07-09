package com.firefly.fireflybe.likes

import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.users.User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

data class LikeToggleResult(val liked: Boolean, val count: Long)

@Service
class LikeService(
    private val likeRepository: LikeRepository,
    private val memoryService: MemoryService
) {

    @Transactional
    fun toggle(user: User, memoryId: Long): LikeToggleResult {
        val memory = memoryService.findOrThrow(memoryId)
        memoryService.ensureViewAllowed(memory, user)

        val existing = likeRepository.findByUserIdAndMemoryId(user.id, memoryId)
        if (existing != null) {
            likeRepository.delete(existing)
        } else {
            likeRepository.save(Like(user = user, memory = memory))
        }
        return LikeToggleResult(
            liked = existing == null,
            count = likeRepository.countByMemoryId(memoryId)
        )
    }
}
