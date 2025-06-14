package com.example.SWPP.config;

import com.example.SWPP.entity.Role;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.RoleRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("DataInitializer is running...");

        // Khởi tạo vai trò Admin nếu chưa tồn tại
        Optional<Role> adminRole = roleRepository.findByRoleName("Admin");
        if (!adminRole.isPresent()) {
            Role newAdminRole = new Role();
            newAdminRole.setRoleName("Admin");
            newAdminRole.setDescription("Quản trị viên hệ thống");
            roleRepository.save(newAdminRole);
            logger.info("Created Admin role");
        }

        // Khởi tạo vai trò Member nếu chưa tồn tại
        Optional<Role> memberRole = roleRepository.findByRoleName("Member");
        if (!memberRole.isPresent()) {
            Role newMemberRole = new Role();
            newMemberRole.setRoleName("Member");
            newMemberRole.setDescription("Thành viên đã đăng ký");
            roleRepository.save(newMemberRole);
            logger.info("Created Member role");
        }

        // Tạo hoặc cập nhật người dùng Admin
        ensureUser("admin@example.com", "admin", "Admin User", "1234567890", "adminpass123", "Admin");

        // Tạo hoặc cập nhật người dùng Member
        ensureUser("member@example.com", "member", "Member User", "0987654321", "memberpass123", "Member");

        // Mã hóa lại mật khẩu cho tất cả người dùng hiện có
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            String currentPassword = user.getPasswordHash();
            if (currentPassword != null && !currentPassword.trim().isEmpty() && !isBcryptEncoded(currentPassword)) {
                // Giữ nguyên mật khẩu hiện tại nhưng mã hóa lại
                String encodedPassword = passwordEncoder.encode(currentPassword);
                user.setPasswordHash(encodedPassword);
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
                logger.info("Re-encoded password for email={} with existing password: {}", user.getEmail(), encodedPassword);
            } else if (currentPassword == null || currentPassword.trim().isEmpty()) {
                // Nếu mật khẩu trống, đặt một giá trị mặc định (có thể tùy chỉnh)
                String defaultPassword = "temp123"; // Bạn có thể thay bằng giá trị khác
                String encodedPassword = passwordEncoder.encode(defaultPassword);
                user.setPasswordHash(encodedPassword);
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
                logger.warn("Set default encoded password for email={} because it was empty: {}", user.getEmail(), encodedPassword);
            } else {
                logger.info("Password for email={} is already encoded or valid", user.getEmail());
            }
        }
    }

    private void ensureUser(String email, String username, String fullName, String phone, String password, String roleName) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (!existingUser.isPresent()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPhone(phone);
            user.setStatus(1);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setLoginType("standard");
            user.setRole(roleRepository.findByRoleName(roleName).get());
            userRepository.save(user);
            logger.info("Created user with email={} and encoded password", email);
        } else {
            logger.info("User with email={} already exists", email);
        }
    }

    private boolean isBcryptEncoded(String passwordHash) {
        return passwordHash != null && (passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2b$") || passwordHash.startsWith("$2y$"));
    }
}