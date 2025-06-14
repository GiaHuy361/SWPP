package com.example.SWPP.config;

import com.example.SWPP.service.GoogleTokenVerifierService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${google.client.id}")
    private String googleClientId;

    @Bean
    public GoogleTokenVerifierService googleTokenVerifierService() {
        return new GoogleTokenVerifierService(googleClientId);
    }
}