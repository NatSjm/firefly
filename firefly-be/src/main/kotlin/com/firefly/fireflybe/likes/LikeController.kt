package com.firefly.fireflybe.likes

import com.firefly.fireflybe.users.User
import jakarta.validation.constraints.NotNull
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/likes")
class LikeController(private val likeService: LikeService) {

    @PostMapping
    fun toggleLike(
        @RequestBody req: LikeToggleRequest,
        authentication: Authentication
    ): LikeToggleResult = likeService.toggle(authentication.principal as User, req.memoryId)
}

data class LikeToggleRequest(@field:NotNull val memoryId: Long)
