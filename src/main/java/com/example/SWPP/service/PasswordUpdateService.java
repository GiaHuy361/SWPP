package com.example.SWPP.service;

import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PasswordUpdateService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public PasswordUpdateService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public void encodeAllPasswords() {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            String rawPassword = user.getPasswordHash(); // Lấy mật khẩu hiện tại (chưa mã hóa)
            if (rawPassword != null && !rawPassword.startsWith("$2a$")) {
                // Kiểm tra xem mật khẩu đã được mã hóa chưa (BCrypt hash bắt đầu bằng $2a$)
                String encodedPassword = passwordEncoder.encode(rawPassword);
                user.setPasswordHash(encodedPassword);
                userRepository.save(user);
                System.out.println("Đã mã hóa mật khẩu cho user: " + user.getEmail());
            }
        }
    }
}
