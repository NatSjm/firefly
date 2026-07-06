package com.firefly.fireflybe.comments

import org.springframework.data.jpa.repository.JpaRepository

interface CommentRepository : JpaRepository<Comment, Long> {
    fun findByMemoryIdOrderByCreatedAtAsc(memoryId: Long): List<Comment>
    fun countByMemoryId(memoryId: Long): Long
}
