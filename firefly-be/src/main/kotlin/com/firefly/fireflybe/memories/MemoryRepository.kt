package com.firefly.fireflybe.memories

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface MemoryRepository : JpaRepository<Memory, Long> {
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<Memory>
    fun findByUserIdAndIsPublicOrderByCreatedAtDesc(userId: Long, isPublic: Boolean): List<Memory>

    @Query(
        """
        SELECT m FROM Memory m
        WHERE m.isPublic = true
        AND (:city IS NULL OR m.city = :city)
        AND (:topicSlug IS NULL OR m.topicSlug = :topicSlug)
        ORDER BY m.createdAt DESC
        """
    )
    fun findPublicByFilters(
        @Param("city") city: String?,
        @Param("topicSlug") topicSlug: String?,
        pageable: Pageable
    ): Page<Memory>

    @Query(
        """
        SELECT m FROM Memory m
        WHERE m.isPublic = true
        AND (:city IS NULL OR m.city = :city)
        AND (:topicSlug IS NULL OR m.topicSlug = :topicSlug)
        ORDER BY
            (SELECT COUNT(l.id) FROM MemoryLike l WHERE l.memory.id = m.id) DESC,
            m.createdAt DESC
        """
    )
    fun findPublicByFiltersOrderByPopularity(
        @Param("city") city: String?,
        @Param("topicSlug") topicSlug: String?,
        pageable: Pageable
    ): Page<Memory>
}
