package com.firefly.fireflybe.admin

import com.firefly.fireflybe.comments.CommentRepository
import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.config.AppProperties
import com.firefly.fireflybe.memories.Media
import com.firefly.fireflybe.memories.Memory
import com.firefly.fireflybe.memories.MemoryRepository
import com.firefly.fireflybe.memories.MemoryService
import com.firefly.fireflybe.reports.Report
import com.firefly.fireflybe.reports.ReportRepository
import com.firefly.fireflybe.users.User
import com.firefly.fireflybe.users.UserRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import java.lang.reflect.Proxy
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

// @trace FR-MOD-03, FR-MOD-04

class AdminServiceTest {

    private val reports = RecordingReportRepository()
    private val memories = RecordingMemoryRepository()
    private val comments = RecordingCommentRepository()
    private val users = RecordingUserRepository()
    private val memoryService = RecordingMemoryService()
    private val service = AdminService(reports.proxy, memories.proxy, comments.proxy, users.proxy, memoryService)

    private fun user(id: Long, role: String = "user", banned: Boolean = false) =
        User(id = id, name = "Користувач $id", email = "user$id@t.com", passwordHash = "hash", role = role, isBanned = banned)

    // @trace FR-MOD-03
    @Test
    fun `reports returns the stored report rows`() {
        val row = Report(id = 3L, targetType = "memory", targetId = 9L, reporterId = 1L, reason = "Спам")
        reports.findAllResult = listOf(row)

        val result = service.reports()

        assertEquals(1, result.size)
        assertEquals(3L, result[0].id)
        assertEquals("memory", result[0].targetType)
        assertEquals(9L, result[0].targetId)
        assertEquals("Спам", result[0].reason)
    }

    // @trace FR-MOD-03
    @Test
    fun `users maps entities to the admin dto without the password hash`() {
        users.findAllResult = listOf(user(id = 1, role = "admin"), user(id = 2, banned = true))

        val result = service.users()

        assertEquals(2, result.size)
        assertEquals(AdminUserDto(1L, "Користувач 1", "user1@t.com", "admin", false), result[0])
        assertEquals(AdminUserDto(2L, "Користувач 2", "user2@t.com", "user", true), result[1])
    }

    // @trace FR-MOD-04
    @Test
    fun `deleteMemory removes the memory, its reports, and its photo files`() {
        val memory = Memory(id = 9L, user = user(1), title = "Спогад", text = "Текст")
        memory.media.add(Media(id = 1L, memory = memory, url = "/uploads/a.jpg"))
        memory.media.add(Media(id = 2L, memory = memory, url = "/uploads/b.png"))
        memories.findByIdResult = memory

        service.deleteMemory(9L)

        assertEquals(memory, memories.deletedMemory)
        assertEquals("memory" to 9L, reports.deletedTarget)
        assertEquals(listOf("/uploads/a.jpg", "/uploads/b.png"), memoryService.deletedUrls)
    }

    // @trace FR-MOD-04
    @Test
    fun `deleteMemory throws 404 for a missing id`() {
        memories.findByIdResult = null

        val exception = assertThrows<ApiException> { service.deleteMemory(999L) }

        assertEquals(HttpStatus.NOT_FOUND, exception.status)
        assertNull(memories.deletedMemory)
        assertNull(reports.deletedTarget)
    }

    // @trace FR-MOD-04
    @Test
    fun `deleteComment removes the comment and its reports`() {
        comments.existsByIdResult = true

        service.deleteComment(5L)

        assertEquals(5L, comments.deletedId)
        assertEquals("comment" to 5L, reports.deletedTarget)
    }

    // @trace FR-MOD-04
    @Test
    fun `deleteComment throws 404 for a missing id`() {
        comments.existsByIdResult = false

        val exception = assertThrows<ApiException> { service.deleteComment(999L) }

        assertEquals(HttpStatus.NOT_FOUND, exception.status)
        assertNull(comments.deletedId)
        assertNull(reports.deletedTarget)
    }

    // @trace FR-MOD-04
    @Test
    fun `toggleBan bans an active user and unbans a banned one`() {
        val admin = user(id = 1, role = "admin")
        val target = user(id = 2)
        users.findByIdResult = target

        assertTrue(service.toggleBan(2L, admin))
        assertTrue(target.isBanned)
        assertEquals(target, users.savedUser)

        assertFalse(service.toggleBan(2L, admin))
        assertFalse(target.isBanned)
    }

    // @trace FR-MOD-04
    @Test
    fun `toggleBan refuses to ban the acting admin themselves`() {
        val admin = user(id = 1, role = "admin")
        users.findByIdResult = admin

        val exception = assertThrows<ApiException> { service.toggleBan(1L, admin) }

        assertEquals(HttpStatus.BAD_REQUEST, exception.status)
        assertFalse(admin.isBanned)
        assertNull(users.savedUser)
    }

    // @trace FR-MOD-04
    @Test
    fun `toggleBan refuses to ban another admin`() {
        val actingAdmin = user(id = 1, role = "admin")
        val otherAdmin = user(id = 2, role = "admin")
        users.findByIdResult = otherAdmin

        val exception = assertThrows<ApiException> { service.toggleBan(2L, actingAdmin) }

        assertEquals(HttpStatus.BAD_REQUEST, exception.status)
        assertFalse(otherAdmin.isBanned)
        assertNull(users.savedUser)
    }

    // @trace FR-MOD-04
    @Test
    fun `toggleBan throws 404 for a missing user`() {
        users.findByIdResult = null

        val exception = assertThrows<ApiException> { service.toggleBan(999L, user(id = 1, role = "admin")) }

        assertEquals(HttpStatus.NOT_FOUND, exception.status)
    }

    private class RecordingMemoryService : MemoryService(
        unusedProxy(),
        unusedProxy(),
        unusedProxy(),
        AppProperties()
    ) {
        var deletedUrls: List<String>? = null

        override fun deletePhotoFiles(urls: List<String>) {
            deletedUrls = urls
        }
    }

    private class RecordingReportRepository {
        var findAllResult: List<Report> = emptyList()
        var deletedTarget: Pair<String, Long>? = null

        val proxy: ReportRepository = recordingProxy { method, args ->
            when (method) {
                "findAll" -> findAllResult
                "deleteAllByTargetTypeAndTargetId" -> {
                    deletedTarget = args!![0] as String to args[1] as Long
                    null
                }
                else -> UNEXPECTED
            }
        }
    }

    private class RecordingMemoryRepository {
        var findByIdResult: Memory? = null
        var deletedMemory: Memory? = null

        val proxy: MemoryRepository = recordingProxy { method, args ->
            when (method) {
                "findById" -> Optional.ofNullable(findByIdResult)
                "delete" -> {
                    deletedMemory = args!![0] as Memory
                    null
                }
                else -> UNEXPECTED
            }
        }
    }

    private class RecordingCommentRepository {
        var existsByIdResult = false
        var deletedId: Long? = null

        val proxy: CommentRepository = recordingProxy { method, args ->
            when (method) {
                "existsById" -> existsByIdResult
                "deleteById" -> {
                    deletedId = args!![0] as Long
                    null
                }
                else -> UNEXPECTED
            }
        }
    }

    private class RecordingUserRepository {
        var findAllResult: List<User> = emptyList()
        var findByIdResult: User? = null
        var savedUser: User? = null

        val proxy: UserRepository = recordingProxy { method, args ->
            when (method) {
                "findAll" -> findAllResult
                "findById" -> Optional.ofNullable(findByIdResult)
                "save" -> {
                    savedUser = args!![0] as User
                    savedUser
                }
                else -> UNEXPECTED
            }
        }
    }

    private companion object {
        val UNEXPECTED = Any()

        inline fun <reified T> unusedProxy(): T = recordingProxy { _, _ -> UNEXPECTED }

        inline fun <reified T> recordingProxy(noinline handler: (String, Array<Any?>?) -> Any?): T =
            Proxy.newProxyInstance(T::class.java.classLoader, arrayOf(T::class.java)) { _, method, args ->
                when (method.name) {
                    "equals" -> false
                    "hashCode" -> System.identityHashCode(handler)
                    "toString" -> "RecordingProxy<${T::class.java.simpleName}>"
                    else -> {
                        val result = handler(method.name, args)
                        if (result === UNEXPECTED) {
                            throw UnsupportedOperationException("unexpected call: ${method.name}")
                        }
                        result
                    }
                }
            } as T
    }
}
