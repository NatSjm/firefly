package com.firefly.fireflybe.auth

import com.firefly.fireflybe.common.ApiException
import com.firefly.fireflybe.config.JwtService
import com.firefly.fireflybe.users.User
import com.firefly.fireflybe.users.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    fun register(req: RegisterRequest): AuthResponse {
        val email = req.email.trim().lowercase()
        if (userRepository.existsByEmail(email)) {
            throw duplicateEmail()
        }
        val user = User(
            email = email,
            passwordHash = passwordEncoder.encode(req.password)!!,
            name = req.name.trim()
        )
        val saved = try {
            userRepository.save(user)
        } catch (_: DataIntegrityViolationException) {
            throw duplicateEmail()
        }
        return AuthResponse(jwtService.generateToken(saved.id, saved.email), saved.toAuthUserDto())
    }

    fun login(req: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(req.email.trim().lowercase()).orElse(null)
            ?: throw badCredentials()
        if (!passwordEncoder.matches(req.password, user.passwordHash)) {
            throw badCredentials()
        }
        if (user.isBanned) {
            throw ApiException(HttpStatus.FORBIDDEN, "Акаунт заблоковано")
        }
        return AuthResponse(jwtService.generateToken(user.id, user.email), user.toAuthUserDto())
    }

    private fun duplicateEmail() = ApiException(HttpStatus.CONFLICT, "Email вже зареєстровано")

    private fun badCredentials() = ApiException(HttpStatus.UNAUTHORIZED, "Невірний email або пароль")
}
