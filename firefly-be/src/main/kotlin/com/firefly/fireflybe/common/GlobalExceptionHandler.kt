package com.firefly.fireflybe.common

import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.multipart.support.MissingServletRequestPartException

data class ErrorResponse(val error: String, val details: Map<String, String>? = null)

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(ApiException::class)
    fun handleApi(e: ApiException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(e.status).body(ErrorResponse(e.message))

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(e: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val details = e.bindingResult.fieldErrors.associate {
            it.field to (it.defaultMessage ?: "невірне значення")
        }
        // A single field violation is specific enough to surface as the headline
        // message (the FE only renders the top-level `error`, not `details`).
        val message = if (details.size == 1) details.values.first() else "Перевірте заповнення полів"
        return ResponseEntity.badRequest().body(ErrorResponse(message, details))
    }

    @ExceptionHandler(HttpMessageNotReadableException::class, MissingServletRequestPartException::class)
    fun handleUnreadable(e: Exception): ResponseEntity<ErrorResponse> =
        ResponseEntity.badRequest().body(ErrorResponse("Невірний формат запиту"))

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleIntegrity(e: DataIntegrityViolationException): ResponseEntity<ErrorResponse> {
        logger.warn("Data integrity violation", e)
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse("Дія конфліктує з наявними даними"))
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleTypeMismatch(e: MethodArgumentTypeMismatchException): ResponseEntity<ErrorResponse> =
        ResponseEntity.badRequest().body(ErrorResponse("Невірний формат запиту"))

    // Catch-all so no unmapped exception (e.g. a bad anonymous-principal cast,
    // an unexpected NPE) ever leaks a raw stack trace or an un-translated message.
    @ExceptionHandler(Exception::class)
    fun handleUnexpected(e: Exception): ResponseEntity<ErrorResponse> {
        logger.error("Unhandled exception", e)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse("Сталася непередбачена помилка. Спробуйте пізніше"))
    }
}
