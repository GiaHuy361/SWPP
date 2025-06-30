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
                        .requestMatchers(HttpMethod.GET, "/api/admin/role-permissions").permitAll()
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
                        .requestMatchers(HttpMethod.GET, "/api/admin/roles/{roleId}/permissions").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/admin/roles/{roleId}/permissions/{permissionId}").hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/roles/{roleId}/permissions/{id}").hasRole("Admin")
                        // API khảo sát (Survey)
                        .requestMatchers(HttpMethod.POST, "/api/surveys").hasAuthority("MANAGE_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/{id}").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.PUT, "/api/surveys/{id}").hasAuthority("MANAGE_SURVEYS")
                        .requestMatchers(HttpMethod.DELETE, "/api/surveys/{id}").hasAuthority("MANAGE_SURVEYS")
                        // API loại khảo sát (SurveyType)
                        .requestMatchers(HttpMethod.POST, "/api/surveys/types").hasAuthority("MANAGE_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/types").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/types/{id}").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.PUT, "/api/surveys/types/{id}").hasAuthority("MANAGE_SURVEYS")
                        .requestMatchers(HttpMethod.DELETE, "/api/surveys/types/{id}").hasAuthority("MANAGE_SURVEYS")
                        // API câu hỏi khảo sát (SurveyQuestion)
                        .requestMatchers(HttpMethod.POST, "/api/surveys/questions").hasAuthority("MANAGE_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/questions").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/questions/{id}").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.PUT, "/api/surveys/questions/{id}").hasAuthority("MANAGE_SURVEYS")
                        .requestMatchers(HttpMethod.DELETE, "/api/surveys/questions/{id}").hasAuthority("MANAGE_SURVEYS")
                        // API câu trả lời khảo sát (SurveyAnswer)
                        .requestMatchers(HttpMethod.POST, "/api/surveys/answers").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/answers").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/answers/{id}").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.PUT, "/api/surveys/answers/{id}").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.DELETE, "/api/surveys/answers/{id}").hasAuthority("MANAGE_SURVEYS")
                        // API lựa chọn khảo sát (SurveyOption)
                        .requestMatchers(HttpMethod.GET, "/api/surveys/options/{id}").hasAuthority("VIEW_SURVEYS")
                        // API phản hồi khảo sát (SurveyResponse)
                        .requestMatchers(HttpMethod.POST, "/api/surveys/responses").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/responses").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/responses/{id}").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.PUT, "/api/surveys/responses/{id}").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.DELETE, "/api/surveys/responses/{id}").hasAuthority("MANAGE_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/responses/result/{responseId}").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/responses/user").hasAuthority("VIEW_SURVEYS")
                        .requestMatchers(HttpMethod.GET, "/api/surveys/responses/submit-and-recommend").hasAuthority("VIEW_SURVEYS")
                        // API hồ sơ người dùng (UserProfile)
                        .requestMatchers(HttpMethod.POST, "/api/profiles/{userId}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/profiles/{userId}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/profiles/{userId}").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/profiles/{userId}").hasRole("Admin")
                        // API tư vấn viên (Consultant)
                        .requestMatchers(HttpMethod.POST, "/api/consultants").hasAuthority("MANAGE_CONSULTANTS")
                        .requestMatchers(HttpMethod.GET, "/api/consultants").hasAuthority("BOOK_APPOINTMENTS") // Sửa từ MANAGE_CONSULTANTS|MANAGE_APPOINTMENTS thành BOOK_APPOINTMENTS
                        .requestMatchers(HttpMethod.GET, "/api/consultants/{id}").hasAnyAuthority("MANAGE_CONSULTANTS", "MANAGE_APPOINTMENTS")
                        .requestMatchers(HttpMethod.PUT, "/api/consultants/{id}").hasAuthority("MANAGE_CONSULTANTS")
                        .requestMatchers(HttpMethod.DELETE, "/api/consultants/{id}").hasAuthority("MANAGE_CONSULTANTS")
                        // API lịch hẹn (Appointment)
                        .requestMatchers(HttpMethod.POST, "/api/appointments").hasAuthority("BOOK_APPOINTMENTS")
                        .requestMatchers(HttpMethod.GET, "/api/appointments").hasAnyAuthority("BOOK_APPOINTMENTS", "MANAGE_APPOINTMENTS")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/{id}").hasAnyAuthority("BOOK_APPOINTMENTS", "MANAGE_APPOINTMENTS")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/{id}").hasAuthority("MANAGE_APPOINTMENTS")
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/{id}").hasAnyAuthority("MANAGE_APPOINTMENTS", "ROLE_Admin")
                        // API khóa học
                        .requestMatchers(HttpMethod.GET, "/api/courses", "/api/courses/**").hasAuthority("VIEW_COURSES")
                        .requestMatchers(HttpMethod.POST, "/api/courses").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/enroll").hasAuthority("ENROLL_COURSES")
                        .requestMatchers(HttpMethod.GET, "/api/courses/recommendations").hasAuthority("VIEW_COURSES")
                        // API module khóa học
                        .requestMatchers(HttpMethod.GET, "/api/courses/*/modules").hasAuthority("VIEW_COURSES")
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/modules").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.PUT, "/api/courses/*/modules/**").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/*/modules/**").hasAuthority("MANAGE_COURSES")
                        // API lesson khóa học
                        .requestMatchers(HttpMethod.GET, "/api/modules/*/lessons").hasAuthority("VIEW_COURSES")
                        .requestMatchers(HttpMethod.POST, "/api/modules/*/lessons").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.PUT, "/api/modules/*/lessons/**").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.DELETE, "/api/modules/*/lessons/**").hasAuthority("MANAGE_COURSES")
                        // API quiz khóa học
                        .requestMatchers(HttpMethod.GET, "/api/courses/*/quizzes").hasAuthority("VIEW_COURSES")
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/quizzes").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.PUT, "/api/courses/*/quizzes/**").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/*/quizzes/**").hasAuthority("MANAGE_COURSES")
                        // API question của quiz
                        .requestMatchers(HttpMethod.GET, "/api/quizzes/*/questions").hasAuthority("VIEW_COURSES")
                        .requestMatchers(HttpMethod.POST, "/api/quizzes/*/questions").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.PUT, "/api/quizzes/*/questions/**").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.DELETE, "/api/quizzes/*/questions/**").hasAuthority("MANAGE_COURSES")
                        // API answer của question
                        .requestMatchers(HttpMethod.GET, "/api/questions/*/answers").hasAuthority("VIEW_COURSES")
                        .requestMatchers(HttpMethod.POST, "/api/questions/*/answers").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.PUT, "/api/questions/*/answers/**").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.DELETE, "/api/questions/*/answers/**").hasAuthority("MANAGE_COURSES")
                        // API submission của quiz
                        .requestMatchers(HttpMethod.POST, "/api/quizzes/*/submissions").hasAuthority("SUBMIT_QUIZ")
                        .requestMatchers(HttpMethod.GET, "/api/quizzes/*/submissions").hasAuthority("VIEW_PROGRESS")
                        // API answer của submission
                        .requestMatchers(HttpMethod.POST, "/api/submissions/*/questions/*/answers/*").hasAuthority("SUBMIT_QUIZ")
                        .requestMatchers(HttpMethod.DELETE, "/api/submissions/*/questions/*/answers/**").hasAuthority("MANAGE_COURSES")
                        // API certificate
                        .requestMatchers(HttpMethod.POST, "/api/enrollments/*/certificates").hasAuthority("MANAGE_COURSES")
                        .requestMatchers(HttpMethod.GET, "/api/enrollments/*/certificates").hasAuthority("VIEW_CERTIFICATES")
                        // API tiến độ học viên
                        .requestMatchers(HttpMethod.POST, "/api/progress/lessons/*/complete").hasAuthority("COMPLETE_LESSON")
                        .requestMatchers(HttpMethod.GET, "/api/progress/courses/*").hasAuthority("VIEW_PROGRESS")
                        // API ghi danh
                        .requestMatchers(HttpMethod.POST, "/api/enrollments/courses/*").hasAuthority("ENROLL_COURSES")
                        .requestMatchers(HttpMethod.GET, "/api/enrollments/user").hasAuthority("VIEW_COURSES")

                        // API thông báo (Notifications)
                        .requestMatchers(HttpMethod.GET, "/api/notifications").hasAuthority("VIEW_NOTIFICATIONS")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/unread").hasAuthority("VIEW_NOTIFICATIONS")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/{id}").hasAuthority("VIEW_NOTIFICATIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/notifications/{id}/read").hasAuthority("VIEW_NOTIFICATIONS")
                        .requestMatchers(HttpMethod.POST, "/api/notifications").hasAuthority("MANAGE_NOTIFICATIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/notifications/{id}").hasAuthority("MANAGE_NOTIFICATIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/{id}").hasAuthority("MANAGE_NOTIFICATIONS")
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