package com.firefly.fireflybe.config

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.Date

@Service
class JwtService(private val props: AppProperties) {

    private val logger = LoggerFactory.getLogger(JwtService::class.java)

    companion object {
        // Placeholder values shipped in application.properties / docker-compose.yml —
        // anyone who reads the repo knows these, so a deployment that hasn't
        // overridden JWT_SECRET would let anyone forge an admin token.
        private val KNOWN_INSECURE_SECRETS = setOf(
            "svitlyachok-secret-key-change-in-production-min-32-chars",
            "svitlyachok-local-dev-secret-change-in-prod"
        )
    }

    @PostConstruct
    fun warnIfSecretIsInsecure() {
        if (props.jwt.secret in KNOWN_INSECURE_SECRETS || props.jwt.secret.isBlank()) {
            logger.error(
                "SECURITY WARNING: JWT_SECRET is not set to a real secret (using a known placeholder value). " +
                    "Anyone who reads this repo's source can forge a valid auth token, including for an admin " +
                    "account. Set the JWT_SECRET environment variable to a unique, random, >=32-character value " +
                    "before deploying to any environment reachable by untrusted users."
            )
        }
    }

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
