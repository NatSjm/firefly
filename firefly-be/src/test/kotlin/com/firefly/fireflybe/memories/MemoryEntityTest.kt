package com.firefly.fireflybe.memories

import com.firefly.fireflybe.users.User
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class MemoryEntityTest {

    // @trace FR-MEM-03
    @Test
    fun `new memory is private by default`() {
        assertFalse(Memory().isPublic)
    }

    // @trace FR-MEM-01
    @Test
    fun `new memory has type story by default`() {
        assertEquals("story", Memory().type)
    }

    // @trace FR-MEM-02
    @Test
    fun `new memory has no media by default`() {
        assertTrue(Memory().media.isEmpty())
    }

    // @trace FR-MEM-06
    @Test
    fun `toDto maps author, metadata, and media urls`() {
        val author = User(id = 7, name = "Оля")
        val memory = Memory(
            id = 3,
            user = author,
            type = "recipe",
            title = "Бабусин борщ",
            text = "Найсмачніший у світі.",
            ingredients = "буряк, капуста",
            steps = "варити дві години",
            city = "Львів",
            topicSlug = "Бабусині рецепти",
            yearFrom = 1998,
            yearTo = 2004,
            isPublic = true
        )
        memory.media.add(Media(memory = memory, url = "/uploads/borshch.jpg"))

        val dto = memory.toDto(likesCount = 2, commentsCount = 1, likedByMe = true)

        assertEquals(7, dto.userId)
        assertEquals("Оля", dto.authorName)
        assertEquals("recipe", dto.type)
        assertEquals("Бабусин борщ", dto.title)
        assertEquals("буряк, капуста", dto.ingredients)
        assertEquals("варити дві години", dto.steps)
        assertEquals("Львів", dto.city)
        assertEquals("Бабусині рецепти", dto.topicSlug)
        assertEquals(1998, dto.yearFrom)
        assertEquals(2004, dto.yearTo)
        assertTrue(dto.isPublic)
        assertEquals(listOf("/uploads/borshch.jpg"), dto.mediaUrls)
        assertEquals(2, dto.likesCount)
        assertEquals(1, dto.commentsCount)
        assertTrue(dto.likedByMe)
    }
}
