package com.example.SWPP.config;

import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("DataInitializer is running...");

        // Lấy tất cả người dùng hiện có
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
                String defaultPassword = "temp123"; // Bạn có thể thay bằng giá trị khác hoặc bỏ qua
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

    private boolean isBcryptEncoded(String passwordHash) {
        return passwordHash != null && (passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2b$") || passwordHash.startsWith("$2y$"));
    }
}
