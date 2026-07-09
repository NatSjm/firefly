package com.firefly.fireflybe.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.nio.file.Paths

@Configuration
class WebConfig(private val props: AppProperties) : WebMvcConfigurer {
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        val uploadPath = Paths.get(props.uploadDir).toAbsolutePath().normalize()
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPath.toUri().toString())
    }
}
