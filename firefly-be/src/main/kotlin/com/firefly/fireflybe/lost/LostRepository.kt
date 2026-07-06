package com.firefly.fireflybe.lost

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface LostRequestRepository : JpaRepository<LostRequest, Long> {
    @Query(
        """
        SELECT l FROM LostRequest l
        WHERE (:city IS NULL OR l.city = :city)
        AND (:type IS NULL OR l.type = :type)
        ORDER BY l.createdAt DESC
        """
    )
    fun findByFilters(@Param("city") city: String?, @Param("type") type: String?): List<LostRequest>
}
