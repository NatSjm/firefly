package com.firefly.fireflybe.users

import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @PutMapping("/me")
    fun updateProfile(
        @Valid @RequestBody req: UpdateProfileRequest,
        authentication: Authentication
    ): UserDto = userService.updateProfile(authentication.principal as User, req)
}
