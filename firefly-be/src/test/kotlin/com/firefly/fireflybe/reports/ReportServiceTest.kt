package com.firefly.fireflybe.reports

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.users.User
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import java.lang.reflect.Proxy
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertNull

// @trace FR-MOD-02

class ReportServiceTest {

    private val repo = RecordingReportRepository()
    private val memories = RecordingMemoryRepository(existsResult = true)
    private val comments = RecordingCommentRepository(existsResult = true)
    private val service = ReportService(repo.proxy, memories.proxy, comments.proxy)

    private fun reporter(id: Long = 7L) =
        User(id = id, name = "Репортер", email = "reporter@t.com", passwordHash = "x")

    // @trace FR-MOD-02
    @Test
    fun `create persists a report stamped with the reporter and trimmed fields`() {
        val req = ReportRequest(targetType = "  memory  ", targetId = 42L, reason = "  Образливий вміст  ")

        service.create(reporter(id = 7L), req)

        val saved = repo.savedReport
        checkNotNull(saved)
        assertEquals("memory", saved.targetType)
        assertEquals(42L, saved.targetId)
        assertEquals(7L, saved.reporterId)
        assertEquals("Образливий вміст", saved.reason)
    }

    // @trace FR-MOD-02
    @Test
    fun `create stores an absent reason as null`() {
        service.create(reporter(), ReportRequest(targetType = "comment", targetId = 5L, reason = null))

        val saved = repo.savedReport
        checkNotNull(saved)
        assertEquals("comment", saved.targetType)
        assertNull(saved.reason)
    }

    // @trace FR-MOD-02
    @Test
    fun `create coerces a whitespace-only reason to null`() {
        service.create(reporter(), ReportRequest(targetType = "memory", targetId = 5L, reason = "   "))

        assertNull(repo.savedReport?.reason)
    }

    // @trace FR-MOD-02
    @Test
    fun `create rejects a target type outside memory and comment with 400`() {
        val exception = assertThrows<ApiException> {
            service.create(reporter(), ReportRequest(targetType = "post", targetId = 5L, reason = null))
        }

        assertEquals(HttpStatus.BAD_REQUEST, exception.status)
        assertNull(repo.savedReport)
    }

    // @trace FR-MOD-02
    @Test
    fun `create rejects a memory report when the memory does not exist with 404`() {
        val service404 = ReportService(repo.proxy, RecordingMemoryRepository(existsResult = false).proxy, comments.proxy)

        val exception = assertThrows<ApiException> {
            service404.create(reporter(), ReportRequest(targetType = "memory", targetId = 99L, reason = null))
        }

        assertEquals(HttpStatus.NOT_FOUND, exception.status)
        assertNull(repo.savedReport)
    }

    // @trace FR-MOD-02
    @Test
    fun `create rejects a comment report when the comment does not exist with 404`() {
        val service404 = ReportService(repo.proxy, memories.proxy, RecordingCommentRepository(existsResult = false).proxy)

        val exception = assertThrows<ApiException> {
            service404.create(reporter(), ReportRequest(targetType = "comment", targetId = 99L, reason = null))
        }

        assertEquals(HttpStatus.NOT_FOUND, exception.status)
        assertNull(repo.savedReport)
    }

    private class RecordingReportRepository {
        var savedReport: Report? = null

        val proxy: ReportRepository =
            Proxy.newProxyInstance(
                ReportRepository::class.java.classLoader,
                arrayOf(ReportRepository::class.java)
            ) { _, method, args ->
                when (method.name) {
                    "save" -> {
                        savedReport = args?.get(0) as Report
                        savedReport
                    }
                    "equals" -> false
                    "hashCode" -> System.identityHashCode(this)
                    "toString" -> "RecordingReportRepository"
                    else -> throw UnsupportedOperationException("unexpected call: ${method.name}")
                }
            } as ReportRepository
    }

    private class RecordingMemoryRepository(private val existsResult: Boolean) {
        val proxy: MemoryRepository =
            Proxy.newProxyInstance(
                MemoryRepository::class.java.classLoader,
                arrayOf(MemoryRepository::class.java)
            ) { _, method, args ->
                when (method.name) {
                    "existsById" -> existsResult
                    "findById" -> Optional.empty<Any>()
                    "equals" -> false
                    "hashCode" -> System.identityHashCode(this)
                    "toString" -> "RecordingMemoryRepository"
                    else -> throw UnsupportedOperationException("unexpected call: ${method.name}")
                }
            } as MemoryRepository
    }

    private class RecordingCommentRepository(private val existsResult: Boolean) {
        val proxy: CommentRepository =
            Proxy.newProxyInstance(
                CommentRepository::class.java.classLoader,
                arrayOf(CommentRepository::class.java)
            ) { _, method, args ->
                when (method.name) {
                    "existsById" -> existsResult
                    "equals" -> false
                    "hashCode" -> System.identityHashCode(this)
                    "toString" -> "RecordingCommentRepository"
                    else -> throw UnsupportedOperationException("unexpected call: ${method.name}")
                }
            } as CommentRepository
    }
}
