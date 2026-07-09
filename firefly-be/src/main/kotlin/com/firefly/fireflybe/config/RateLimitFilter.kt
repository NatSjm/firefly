package com.firefly.fireflybe.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.concurrent.ConcurrentHashMap

/**
 * Minimal in-memory per-IP sliding-window limiter for the unauthenticated
 * auth endpoints (login/register have no other throttle and bcrypt makes
 * each attempt CPU-expensive server-side, so unlimited attempts double as
 * a cheap credential-stuffing and CPU-exhaustion vector).
 *
 * Disabled in the integration-test suite (see IntegrationTestBase's
 * DynamicPropertySource) since those tests legitimately register/login far
 * more than a real client would inside a minute.
 */
@Component
class RateLimitFilter(
    @param:Value("\${app.rate-limit.enabled:true}") private val enabled: Boolean,
    @param:Value("\${app.rate-limit.max-requests:20}") private val maxRequests: Int,
    @param:Value("\${app.rate-limit.window-ms:60000}") private val windowMs: Long
) : OncePerRequestFilter() {

    private data class Window(var windowStartMs: Long, var count: Int)

    private val limitedPaths = setOf("/api/auth/login", "/api/auth/register")
    private val buckets = ConcurrentHashMap<String, Window>()

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        if (!enabled || request.method != "POST" || request.requestURI !in limitedPaths) {
            filterChain.doFilter(request, response)
            return
        }

        val key = "${clientIp(request)}:${request.requestURI}"
        val now = System.currentTimeMillis()
        val blocked = synchronized(buckets) {
            val bucket = buckets.getOrPut(key) { Window(now, 0) }
            if (now - bucket.windowStartMs > windowMs) {
                bucket.windowStartMs = now
                bucket.count = 0
            }
            bucket.count += 1
            bucket.count > maxRequests
        }

        if (blocked) {
            response.status = 429
            response.contentType = "application/json;charset=UTF-8"
            response.writer.write("{\"error\":\"Забагато спроб. Спробуйте пізніше.\"}")
            return
        }

        filterChain.doFilter(request, response)
    }

    private fun clientIp(request: HttpServletRequest): String =
        request.getHeader("X-Forwarded-For")?.substringBefore(",")?.trim()?.takeIf { it.isNotBlank() }
            ?: request.remoteAddr
}
