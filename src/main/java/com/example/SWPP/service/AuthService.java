package com.example.SWPP.service;

import com.example.SWPP.entity.RolePermission;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    public AuthService(UserRepository userRepository, GoogleTokenVerifierService googleTokenVerifierService) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.googleTokenVerifierService = googleTokenVerifierService;
    }

    public boolean authenticate(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    public void encodeAndSavePassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            System.out.println("User không tồn tại với email: " + email);
            return;
        }

        User user = userOpt.get();
        String rawPassword = user.getPasswordHash();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        user.setPasswordHash(encodedPassword);
        userRepository.save(user);

        System.out.println("Mật khẩu đã được mã hóa và lưu thành công cho user: " + email);
    }

    public GoogleIdToken.Payload verifyGoogleToken(String idTokenString) throws Exception {
        return googleTokenVerifierService.verify(idTokenString);
    }

    public List<String> getUserPermissions(User user) {
        if (user.getRole() == null) {
            return List.of();
        }
        return user.getRole().getRolePermissions().stream()
                .map(RolePermission::getPermissionName)
                .collect(Collectors.toList());
    }
}