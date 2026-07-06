package com.firefly.fireflybe.reports

import com.firefly.fireflybe.users.User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ReportService(private val reportRepository: ReportRepository) {

    @Transactional
    fun create(user: User, req: ReportRequest) {
        reportRepository.save(
            Report(
                targetType = req.targetType.trim(),
                targetId = req.targetId,
                reporterId = user.id,
                reason = req.reason?.trim()?.ifBlank { null }
            )
        )
    }
}
