package com.firefly.fireflybe.memories

import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.config.AppProperties
import com.firefly.fireflybe.users.User
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.io.TempDir
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockMultipartFile
import java.lang.reflect.Proxy
import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class MemoryServiceTest {

    @TempDir
    lateinit var uploadDir: Path

    // ensureViewAllowed and savePhoto never touch the repositories, so unused
    // no-op proxies keep this a pure unit test without a mocking library.
    private fun service(): MemoryService {
        val props = AppProperties().apply { uploadDir = this@MemoryServiceTest.uploadDir.toString() }
        return MemoryService(unusedProxy(), unusedProxy(), unusedProxy(), props)
    }

    private inline fun <reified T> unusedProxy(): T =
        Proxy.newProxyInstance(T::class.java.classLoader, arrayOf(T::class.java)) { _, method, _ ->
            throw UnsupportedOperationException("unexpected call: ${method.name}")
        } as T

    private fun memory(owner: User, isPublic: Boolean) =
        Memory(id = 1, user = owner, title = "Спогад", text = "Текст", isPublic = isPublic)

    // @trace FR-MEM-03
    @Test
    fun `public memory is viewable anonymously`() {
        service().ensureViewAllowed(memory(User(id = 1), isPublic = true), currentUser = null)
    }

    // @trace FR-MEM-06
    @Test
    fun `private memory is viewable by its owner`() {
        val owner = User(id = 1)

        service().ensureViewAllowed(memory(owner, isPublic = false), currentUser = owner)
    }

    // @trace FR-MEM-06
    @Test
    fun `private memory is viewable by an admin`() {
        val admin = User(id = 2, role = "admin")

        service().ensureViewAllowed(memory(User(id = 1), isPublic = false), currentUser = admin)
    }

    // @trace FR-MEM-03
    @Test
    fun `private memory is forbidden for another user`() {
        val exception = assertThrows<ApiException> {
            service().ensureViewAllowed(memory(User(id = 1), isPublic = false), currentUser = User(id = 2))
        }

        assertEquals(HttpStatus.FORBIDDEN, exception.status)
    }

    // @trace FR-MEM-03
    @Test
    fun `private memory is forbidden anonymously`() {
        val exception = assertThrows<ApiException> {
            service().ensureViewAllowed(memory(User(id = 1), isPublic = false), currentUser = null)
        }

        assertEquals(HttpStatus.FORBIDDEN, exception.status)
    }

    // @trace FR-MEM-02
    @Test
    fun `savePhoto stores the file and returns an uploads url`() {
        val photo = MockMultipartFile("photo", "Дитинство.PNG", "image/png", byteArrayOf(1, 2, 3))

        val url = service().savePhoto(photo)

        assertTrue(url.matches(Regex("/uploads/[0-9a-f-]{36}\\.png")), "unexpected url: $url")
        val stored = uploadDir.resolve(url.removePrefix("/uploads/"))
        assertTrue(Files.exists(stored))
        assertEquals(3, Files.size(stored))
    }

    // @trace FR-MEM-02
    @Test
    fun `savePhoto rejects files that are not images`() {
        val page = MockMultipartFile("photo", "attack.html", "text/html", byteArrayOf(1))

        val exception = assertThrows<ApiException> {
            service().savePhoto(page)
        }

        assertEquals(HttpStatus.BAD_REQUEST, exception.status)
        assertEquals(0, Files.list(uploadDir).count())
    }

    // @trace FR-MEM-05
    @Test
    fun `deletePhotoFiles removes stored files and ignores missing ones`() {
        val stored = Files.write(uploadDir.resolve("old-photo.jpg"), byteArrayOf(1))

        service().deletePhotoFiles(listOf("/uploads/old-photo.jpg", "/uploads/never-existed.jpg"))

        assertTrue(Files.notExists(stored))
    }

    // @trace FR-MEM-05
    @Test
    fun `deletePhotoFiles never escapes the upload directory`() {
        val outside = Files.write(uploadDir.parent.resolve("outside.jpg"), byteArrayOf(1))

        service().deletePhotoFiles(listOf("/uploads/../outside.jpg"))

        assertTrue(Files.exists(outside))
    }
}
