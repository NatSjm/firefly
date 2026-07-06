package com.firefly.fireflybe.memories

import com.firefly.fireflybe.users.User
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "memories")
class Memory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User = User(),

    @Column(nullable = false, length = 20)
    var type: String = "story",

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(nullable = false, columnDefinition = "TEXT")
    var text: String = "",

    @Column(columnDefinition = "TEXT")
    var ingredients: String? = null,

    @Column(columnDefinition = "TEXT")
    var steps: String? = null,

    @Column(length = 120)
    var city: String? = null,

    @Column(name = "topic_slug", length = 60)
    var topicSlug: String? = null,

    @Column(name = "year_from")
    var yearFrom: Int? = null,

    @Column(name = "year_to")
    var yearTo: Int? = null,

    @Column(name = "is_public", nullable = false)
    var isPublic: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at")
    var updatedAt: Instant? = null,

    @OneToMany(mappedBy = "memory", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    val media: MutableList<Media> = mutableListOf()
)

@Entity
@Table(name = "media")
class Media(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id", nullable = false)
    var memory: Memory = Memory(),

    @Column(nullable = false, length = 512)
    var url: String = "",

    @Column(nullable = false, length = 20)
    var type: String = "image"
)
