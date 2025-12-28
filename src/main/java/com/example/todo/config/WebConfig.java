package com.example.todo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5500") // Tạm thời cho phép tất cả để test, sau này đổi thành port cụ thể
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "X-Auth-Token")
                .exposedHeaders("X-Auth-Token")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(
                        "/styles.css/**",
                        "/auth.js/**",
                        "/todo.js/**",
                        "/images/**",
                        "/webjars/**",
                        "/favicon.ico",
                        "/index.html")
                .addResourceLocations(
                        "classpath:/static/styles.css/",
                        "classpath:/static/auth.js/",
                        "classpath:/static/todo.js/",
                        "classpath:/static/images/",
                        "classpath:/META-INF/resources/webaars/",
                        "classpath:/static/favicon.ico",
                        "classpath:/static/index.html");

        registry.addResourceHandler("swagger-ui.html")
                .addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }
}