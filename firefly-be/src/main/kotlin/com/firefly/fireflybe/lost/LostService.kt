package com.firefly.fireflybe.lost

import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.users.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class LostService(private val lostRequestRepository: LostRequestRepository) {

    private val yearRangePattern = Regex("^(\\d{4})\\s*[-–—]\\s*(\\d{4})$")

    fun list(city: String?, type: String?): List<LostRequestSummaryDto> =
        lostRequestRepository.findByFilters(
            city?.trim()?.takeIf { it.isNotBlank() },
            type?.trim()?.takeIf { it.isNotBlank() }
        ).map { it.toSummaryDto() }

    @Transactional
    fun create(user: User, req: LostRequestRequest): LostRequestDto {
        val years = req.years?.trim()?.ifBlank { null }
        years?.let {
            val match = yearRangePattern.matchEntire(it)
            if (match != null) {
                val (from, to) = match.destructured
                if (from.toInt() > to.toInt()) {
                    throw ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Перевірте діапазон років — кінцевий рік не може бути раніше початкового."
                    )
                }
            }
        }

        val lostRequest = LostRequest(
            user = user,
            city = req.city.trim(),
            type = req.type.trim(),
            years = years,
            description = req.description.trim(),
            contactEmail = req.contactEmail.trim()
        )
        return lostRequestRepository.save(lostRequest).toDto()
    }

    fun get(id: Long): LostRequestDto =
        lostRequestRepository.findById(id)
            .orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Запит не знайдено") }
            .toDto()
}
