package com.firefly.fireflybe.feed

import com.firefly.fireflybe.users.User
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/feed")
class FeedController(private val feedService: FeedService) {

    @GetMapping
    fun getFeed(
        @RequestParam(required = false) city: String?,
        @RequestParam(required = false) topic: String?,
        @RequestParam(defaultValue = "new") sort: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication?
    ): FeedResponse =
        feedService.getFeed(city, topic, sort, page, size, authentication?.principal as? User)
}
