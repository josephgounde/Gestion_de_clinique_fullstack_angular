package com.groupe.gestion_clinic;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
/*
* configure les CORS (Cross-Origin Resource Sharing) :
* autorise le frontend (http://localhost:3000) à accéder à toutes les routes  backend,
* avec toutes les méthodes HTTP, mais sans envoyer de cookies.
* */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH")
                .allowedHeaders("*")
                .allowCredentials(false);                               // Indique si les cookies ou tokens stockés dans le navigateur sont autorisés
    }
}
