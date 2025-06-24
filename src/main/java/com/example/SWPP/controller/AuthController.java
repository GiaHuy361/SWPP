package com.example.SWPP.controller;

import com.example.SWPP.dto.GoogleLoginRequest;
import com.example.SWPP.dto.LoginRequest;
import com.example.SWPP.dto.RegisterRequest;
import com.example.SWPP.dto.UpdateUserRequest;
import com.example.SWPP.entity.Role;
import com.example.SWPP.entity.RolePermission;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.RoleRepository;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.AuthService;
import com.example.SWPP.service.EmailService;
import com.example.SWPP.service.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthController(
            AuthService authService,
            UserRepository userRepository,
            RoleRepository roleRepository,
            EmailService emailService,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService customUserDetailsService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.emailService = emailService;
        this.authenticationManager = authenticationManager;
        this.customUserDetailsService = customUserDetailsService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, BindingResult bindingResult, HttpServletRequest httpRequest) {
        logger.info("Login attempt: usernameOrEmail={}, sessionId={}", request.getUsernameOrEmail(), httpRequest.getSession().getId());
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Login failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Optional<User> userOptional = userRepository.findByUsername(request.getUsernameOrEmail());
            if (!userOptional.isPresent()) {
                userOptional = userRepository.findByEmail(request.getUsernameOrEmail());
            }
            if (!userOptional.isPresent()) {
                logger.warn("User not found for username or email: {}", request.getUsernameOrEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Tên đăng nhập hoặc email không tồn tại"));
            }
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = httpRequest.getSession(true);
            session.setMaxInactiveInterval(30 * 60);
            logger.info("Login successful: usernameOrEmail={}, authorities={}, sessionId={}",
                    request.getUsernameOrEmail(), authentication.getAuthorities(), session.getId());
            User user = userOptional.get();
            return ResponseEntity.ok(Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "username", user.getUsername(),
                    "fullName", user.getFullName(),
                    "role", user.getRole() != null ? user.getRole().getRoleName() : "Guest",
                    "permissions", authService.getUserPermissions(user)
            ));
        } catch (Exception e) {
            logger.error("Login failed for usernameOrEmail={}: {}", request.getUsernameOrEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tên đăng nhập, email hoặc mật khẩu không hợp lệ"));
        }
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        logger.info("Register attempt: email={}", request.getEmail());
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Registration failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                logger.warn("Registration failed: Email already in use - {}", request.getEmail());
                return ResponseEntity.badRequest().body("Email đã được sử dụng");
            }
            Optional<User> existingUsername = userRepository.findByUsername(request.getUsername());
            if (existingUsername.isPresent()) {
                logger.warn("Registration failed: Username already in use - {}", request.getUsername());
                return ResponseEntity.badRequest().body("Tên đăng nhập đã được sử dụng");
            }

            Role userRole = roleRepository.findByRoleName("Member").orElseGet(() -> {
                Role newRole = new Role();
                newRole.setRoleName("Member");
                newRole.setDescription("Thành viên đã đăng ký");
                return roleRepository.save(newRole);
            });

            User newUser = new User();
            newUser.setUsername(request.getUsername());
            newUser.setEmail(request.getEmail());
            newUser.setFullName(request.getFullName());
            newUser.setPhone(request.getPhone());
            newUser.setStatus(1);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setLoginType("standard");
            newUser.setRole(userRole);

            User savedUser = userRepository.saveAndFlush(newUser);
            logger.info("User registered successfully: email={}, user_id={}", request.getEmail(), savedUser.getUserId());

            CompletableFuture.runAsync(() -> {
                try {
                    String subject = "Xác Nhận Đăng Ký Tài Khoản";
                    String text = "Chào " + savedUser.getFullName() + ",\n\n" +
                            "Tài khoản của bạn đã được tạo thành công!\n" +
                            "Email: " + savedUser.getEmail() + "\n" +
                            "Vui lòng đăng nhập để sử dụng dịch vụ.\n\n" +
                            "Trân trọng,\nHệ thống";
                    emailService.sendSimpleMessage(savedUser.getEmail(), subject, text);
                    logger.info("Confirmation email sent to: {}", savedUser.getEmail());
                } catch (Exception e) {
                    logger.error("Failed to send confirmation email to {}: {}", savedUser.getEmail(), e.getMessage());
                }
            });

            return ResponseEntity.ok(Map.of("message", "Tạo tài khoản thành công"));
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi hệ thống"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        logger.info("Logout attempt: sessionId={}", request.getSession().getId());
        SecurityContextHolder.clearContext();
        request.getSession().invalidate();
        logger.info("Logout successful: session invalidated");
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    @PostMapping("/login-google")
    @Transactional
    public ResponseEntity<?> loginGoogle(@Valid @RequestBody GoogleLoginRequest request, BindingResult bindingResult, HttpServletRequest httpRequest) {
        logger.info("Google login attempt: token={}", request.getIdToken());
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Google login failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Payload payload = authService.verifyGoogleToken(request.getIdToken());
            if (payload == null) {
                logger.warn("Google login failed: Invalid token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Token Google không hợp lệ"));
            }
            String email = payload.getEmail();
            String googleId = payload.getSubject();
            User user = userRepository.findByEmailOrGoogleId(email, googleId).orElse(null);
            boolean isNewUser = user == null;
            if (isNewUser) {
                Role userRole = roleRepository.findByRoleName("Member").orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName("Member");
                    newRole.setDescription("Thành viên đã đăng ký");
                    return roleRepository.save(newRole);
                });

                user = new User();
                user.setEmail(email);
                user.setGoogleId(googleId);
                user.setUsername(email);
                user.setFullName((String) payload.get("name"));
                user.setStatus(1);
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                user.setPasswordHash("");
                user.setLoginType("google");
                user.setRole(userRole);
                user = userRepository.saveAndFlush(user);
                logger.info("New user created via Google login: email={}, user_id={}", email, user.getUserId());

                final User finalUser = user;
                CompletableFuture.runAsync(() -> {
                    try {
                        String subject = "Chào Mừng Bạn Đến Với Hệ Thống";
                        String text = "Chào " + finalUser.getFullName() + ",\n\n" +
                                "Tài khoản của bạn đã được tạo thành công thông qua Google!\n" +
                                "Email: " + finalUser.getEmail() + "\n" +
                                "Vui lòng sử dụng dịch vụ của chúng tôi.\n\n" +
                                "Trân trọng,\nHệ thống";
                        emailService.sendSimpleMessage(finalUser.getEmail(), subject, text);
                        logger.info("Welcome email sent to: {}", finalUser.getEmail());
                    } catch (Exception e) {
                        logger.error("Failed to send welcome email to {}: {}", finalUser.getEmail(), e.getMessage());
                    }
                });
            }
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
            Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = httpRequest.getSession(true);
            logger.info("Google login successful: email={}, sessionId={}, authorities={}", email, session.getId(), userDetails.getAuthorities());
            return ResponseEntity.ok(Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "username", user.getUsername(),
                    "fullName", user.getFullName(),
                    "role", user.getRole() != null ? user.getRole().getRoleName() : "Guest",
                    "permissions", authService.getUserPermissions(user)
            ));
        } catch (Exception e) {
            logger.error("Google login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi hệ thống"));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication, HttpServletRequest request) {
        logger.info("Fetching current user: authentication={}, sessionId={}", authentication, request.getSession().getId());
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            logger.warn("User not authenticated, SecurityContext={}", SecurityContextHolder.getContext());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực"));
        }
        String principal = authentication.getName();
        logger.info("Principal from authentication: {}", principal);
        Optional<User> userOptional = userRepository.findByEmail(principal);
        if (!userOptional.isPresent()) {
            userOptional = userRepository.findByGoogleId(principal);
        }
        if (!userOptional.isPresent()) {
            logger.warn("User not found for principal: {}", principal);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy người dùng"));
        }
        User user = userOptional.get();
        logger.info("User fetched successfully: email={}", user.getEmail());
        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId(),
                "email", user.getEmail(),
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole() != null ? user.getRole().getRoleName() : "Guest",
                "permissions", authService.getUserPermissions(user)
        ));
    }

    @GetMapping("/users/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email, Authentication authentication) {
        logger.info("Fetching user for email={}", email);
        try {
            String currentUserEmail = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_Admin"));
            if (!isAdmin && !currentUserEmail.equals(email)) {
                logger.warn("Unauthorized access attempt: user={} trying to access email={}", currentUserEmail, email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Bạn không có quyền xem thông tin người dùng này"));
            }
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
            return ResponseEntity.ok(Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "username", user.getUsername(),
                    "fullName", user.getFullName(),
                    "phone", user.getPhone() != null ? user.getPhone() : "",
                    "role", user.getRole() != null ? user.getRole().getRoleName() : "Guest",
                    "permissions", authService.getUserPermissions(user)
            ));
        } catch (Exception e) {
            logger.error("Failed to fetch user for email={}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy người dùng"));
        }
    }

    @Transactional
    @GetMapping("/users")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllUsers() {
        logger.info("Fetching all users");
        try {
            List<User> users = userRepository.findAll();
            logger.info("Found {} users", users.size());
            users.forEach(user -> logger.debug("User: email={}, role={}", user.getEmail(), user.getRole() != null ? user.getRole().getRoleName() : "Guest"));
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("userId", user.getUserId());
                userMap.put("email", user.getEmail() != null ? user.getEmail() : "");
                userMap.put("username", user.getUsername() != null ? user.getUsername() : "");
                userMap.put("fullName", user.getFullName() != null ? user.getFullName() : "");
                userMap.put("phone", user.getPhone() != null ? user.getPhone() : "");
                userMap.put("role", user.getRole() != null ? user.getRole().getRoleName() : "Guest");
                userMap.put("permissions", authService.getUserPermissions(user));
                return userMap;
            }).collect(Collectors.toList());
            logger.info("Returning user list with {} entries", userList.size());
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            logger.error("Failed to fetch all users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi lấy danh sách người dùng: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}")
    @Transactional
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @RequestBody UpdateUserRequest updateRequest, BindingResult bindingResult, Authentication authentication) {
        logger.info("Updating user: userId={}", userId);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Update user failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            String currentUserEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseGet(() -> userRepository.findByGoogleId(currentUserEmail)
                            .orElseThrow(() -> new RuntimeException("Người dùng hiện tại không tồn tại")));
            boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_Admin"));
            if (!isAdmin && !currentUser.getUserId().equals(userId)) {
                logger.warn("Unauthorized update attempt: user={} trying to update userId={}", currentUserEmail, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Bạn không có quyền cập nhật thông tin người dùng này"));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

            if (updateRequest.getUsername() != null) {
                String newUsername = updateRequest.getUsername();
                if (userRepository.findByUsername(newUsername).isPresent() && !newUsername.equals(user.getUsername())) {
                    logger.warn("Username already in use: {}", newUsername);
                    return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập đã được sử dụng"));
                }
                user.setUsername(newUsername);
            }
            if (updateRequest.getFullName() != null) {
                user.setFullName(updateRequest.getFullName());
            }
            if (updateRequest.getEmail() != null) {
                String newEmail = updateRequest.getEmail();
                if (userRepository.findByEmail(newEmail).isPresent() && !newEmail.equals(user.getEmail())) {
                    logger.warn("Email already in use: {}", newEmail);
                    return ResponseEntity.badRequest().body(Map.of("message", "Email đã được sử dụng"));
                }
                user.setEmail(newEmail);
            }
            if (updateRequest.getPhone() != null) {
                user.setPhone(updateRequest.getPhone());
            }
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            logger.info("User updated successfully: email={}", user.getEmail());
            return ResponseEntity.ok(Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "username", user.getUsername(),
                    "fullName", user.getFullName(),
                    "phone", user.getPhone() != null ? user.getPhone() : "",
                    "role", user.getRole() != null ? user.getRole().getRoleName() : "Guest",
                    "permissions", authService.getUserPermissions(user)
            ));
        } catch (Exception e) {
            logger.error("Failed to update user: userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật người dùng thất bại"));
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('Admin')")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        logger.info("Deleting user: userId={}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
            userRepository.delete(user);
            logger.info("User deleted successfully: userId={}", userId);
            return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete user: userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa người dùng thất bại"));
        }
    }
}