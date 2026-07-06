package com.firefly.fireflybe.config

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import org.springframework.stereotype.Service
import java.util.Date

@Service
class JwtService(private val props: AppProperties) {

    private val algorithm: Algorithm by lazy {
        Algorithm.HMAC256(props.jwt.secret)
    }

    private val verifier: JWTVerifier by lazy {
        JWT.require(algorithm).build()
    }

    fun generateToken(userId: Long, email: String): String {
        return JWT.create()
            .withSubject(userId.toString())
            .withClaim("email", email)
            .withIssuedAt(Date())
            .withExpiresAt(Date(System.currentTimeMillis() + props.jwt.expirationMs))
            .sign(algorithm)
    }

    fun extractUserId(token: String): Long? = decodeToken(token)?.subject?.toLongOrNull()

    fun extractEmail(token: String): String? = decodeToken(token)?.getClaim("email")?.asString()

    fun isTokenValid(token: String): Boolean = decodeToken(token) != null

    fun validateToken(token: String): Long? {
        return extractUserId(token)
    }

    private fun decodeToken(token: String) = runCatching { verifier.verify(token) }.getOrNull()
}
