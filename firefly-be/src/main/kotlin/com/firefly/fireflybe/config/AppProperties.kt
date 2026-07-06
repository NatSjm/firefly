package com.firefly.fireflybe.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app")
class AppProperties {
    val jwt = JwtProperties()
    val upload = UploadProperties()

    var uploadDir: String
        get() = upload.dir
        set(value) {
            upload.dir = value
        }

    class JwtProperties {
        var secret: String = ""
        var expirationMs: Long = 86400000
    }

    class UploadProperties {
        var dir: String = "./uploads"
    }
}
