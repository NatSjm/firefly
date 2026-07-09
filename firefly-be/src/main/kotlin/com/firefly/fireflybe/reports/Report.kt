package com.firefly.fireflybe.reports

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "reports")
class Report(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "target_type", nullable = false, length = 20)
    var targetType: String = "",

    @Column(name = "target_id", nullable = false)
    var targetId: Long = 0,

    @Column(name = "reporter_id")
    var reporterId: Long? = null,

    @Column(columnDefinition = "TEXT")
    var reason: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
