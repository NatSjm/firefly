package com.firefly.fireflybe.reports

import org.springframework.data.jpa.repository.JpaRepository

interface ReportRepository : JpaRepository<Report, Long>
{
    fun deleteAllByTargetTypeAndTargetId(targetType: String, targetId: Long)
}
