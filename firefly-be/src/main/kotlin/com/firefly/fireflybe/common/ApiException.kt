package com.firefly.fireflybe.common

import org.springframework.http.HttpStatus

/** Domain error surfaced to the client as `{"error": message}` with the given status. */
class ApiException(val status: HttpStatus, override val message: String) : RuntimeException(message)
