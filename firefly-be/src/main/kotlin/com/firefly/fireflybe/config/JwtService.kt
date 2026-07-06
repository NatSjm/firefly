package com.firefly.fireflybe.config

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import org.springframework.stereotype.Service
import java.util.Date

@Service
class JwtService(private val props: AppProperties) {

    private val algorithm: Algorithm by lazy {
        Algorithm.HMAC256(props.jwt.secret)
    }

    fun generateToken(userId: Long, email: String): String {
        return JWT.create()
            .withSubject(userId.toString())
            .withClaim("email", email)
            .withIssuedAt(Date())
            .withExpiresAt(Date(System.currentTimeMillis() + props.jwt.expirationMs))
            .sign(algorithm)
    }

    fun validateToken(token: String): Long? {
        return try {
            val decoded = JWT.require(algorithm).build().verify(token)
            decoded.subject.toLong()
        } catch (_: Exception) {
            null
        }
    }
}
