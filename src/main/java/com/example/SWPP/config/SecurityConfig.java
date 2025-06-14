package com.example.SWPP.config;

import com.example.SWPP.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Vô hiệu hóa CSRF vì sử dụng API REST
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .sessionFixation().migrateSession()
                        .maximumSessions(1) // Giới hạn một phiên đăng nhập mỗi người dùng
                )
                .securityContext(security -> security.requireExplicitSave(false))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                        .accessDeniedHandler((req, res, e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied"))
                )
                .authorizeHttpRequests(authz -> authz
                        // API công khai (permitAll)
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login-google").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/verify-code").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()
                        // API yêu cầu xác thực
                        .requestMatchers(HttpMethod.GET, "/api/auth/user").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/auth/users/{email}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/users/{userId}").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                        // API yêu cầu vai trò Admin
                        .requestMatchers(HttpMethod.GET, "/api/auth/users").hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/auth/users/{userId}").hasRole("Admin")
                        .requestMatchers(HttpMethod.GET, "/api/admin/users/{userId}/role").hasRole("Admin")
                        .requestMatchers(HttpMethod.POST, "/api/admin/users/{userId}/role/{roleId}").hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/users/{userId}/role").hasRole("Admin")
                        .requestMatchers(HttpMethod.POST, "/api/admin/roles").hasRole("Admin")
                        .requestMatchers(HttpMethod.GET, "/api/admin/roles").hasRole("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/roles/{roleId}").hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/roles/{roleId}").hasRole("Admin")
                        .requestMatchers(HttpMethod.POST, "/api/admin/roles/{roleId}/permissions").hasRole("Admin")
                        .requestMatchers(HttpMethod.GET, "/api/admin/roles/{roleId}/permissions").hasRole("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/roles/{roleId}/permissions/{permissionId}").hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/roles/{roleId}/permissions/{permissionId}").hasRole("Admin")
                        // Tất cả các yêu cầu khác yêu cầu xác thực
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}