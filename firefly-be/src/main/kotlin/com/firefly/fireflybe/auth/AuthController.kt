package com.firefly.fireflybe.auth

import com.firefly.fireflybe.config.JwtService
import com.firefly.fireflybe.users.User
import com.firefly.fireflybe.users.UserDto
import com.firefly.fireflybe.users.UserRepository
import com.firefly.fireflybe.users.toDto
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody req: RegisterRequest): ResponseEntity<Any> {
        val normalizedEmail = req.email.trim().lowercase()
        if (userRepository.existsByEmail(normalizedEmail)) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Email вже зареєстровано"))
        }
        val user = User(
            email = normalizedEmail,
            passwordHash = passwordEncoder.encode(req.password)!!,
            name = req.name.trim()
        )
        val saved = userRepository.save(user)
        val token = jwtService.generateToken(saved.id, saved.email)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            AuthResponse(token, saved.id, saved.name, saved.email, saved.role)
        )
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody req: LoginRequest): ResponseEntity<Any> {
        val user = userRepository.findByEmail(req.email.trim().lowercase()).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Невірний email або пароль"))

        if (!passwordEncoder.matches(req.password, user.passwordHash)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Невірний email або пароль"))
        }
        if (user.isBanned) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "Акаунт заблоковано"))
        }
        val token = jwtService.generateToken(user.id, user.email)
        return ResponseEntity.ok(AuthResponse(token, user.id, user.name, user.email, user.role))
    }

    @GetMapping("/me")
    fun me(authentication: Authentication): ResponseEntity<UserDto> {
        val user = authentication.principal as User
        return ResponseEntity.ok(user.toDto())
    }
}
