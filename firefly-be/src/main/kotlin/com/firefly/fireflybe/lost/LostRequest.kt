package com.firefly.fireflybe.lost

import com.firefly.fireflybe.users.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "lost_requests")
class LostRequest(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User = User(),

    @Column(nullable = false, length = 120)
    var city: String = "",

    @Column(nullable = false, length = 30)
    var type: String = "other",

    @Column(length = 50)
    var years: String? = null,

    @Column(nullable = false, columnDefinition = "TEXT")
    var description: String = "",

    @Column(name = "contact_email", nullable = false, length = 255)
    var contactEmail: String = "",

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
