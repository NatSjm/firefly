package com.firefly.fireflybe

import com.firefly.fireflybe.config.AppProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(AppProperties::class)
class FireflyBeApplication {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            runApplication<FireflyBeApplication>(*args)
        }
    }
}
