package com.firefly.fireflybe.likes

import org.springframework.data.jpa.repository.JpaRepository

interface LikeRepository : JpaRepository<Like, Long> {
    fun findByUserIdAndMemoryId(userId: Long, memoryId: Long): Like?
    fun existsByUserIdAndMemoryId(userId: Long, memoryId: Long): Boolean
    fun countByMemoryId(memoryId: Long): Long
}
