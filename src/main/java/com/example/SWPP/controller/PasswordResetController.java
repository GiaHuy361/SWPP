package com.example.SWPP.controller;

import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.EmailService;
import com.example.SWPP.service.VerificationCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final VerificationCodeService verificationCodeService;
    private final BCryptPasswordEncoder passwordEncoder;

    public PasswordResetController(UserRepository userRepository, EmailService emailService,
                                   VerificationCodeService verificationCodeService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.verificationCodeService = verificationCodeService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không tồn tại trong hệ thống");
        }

        String verificationCode = String.format("%06d", new Random().nextInt(999999));
        verificationCodeService.storeCode(request.getEmail(), verificationCode);

        String subject = "Mã xác minh đặt lại mật khẩu";
        String text = "Mã xác minh của bạn là: " + verificationCode;
        emailService.sendSimpleMessage(request.getEmail(), subject, text);

        return ResponseEntity.ok("Mã xác minh đã được gửi tới email của bạn");
    }

    // API kiểm tra mã xác minh riêng
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không tồn tại");
        }

        boolean validCode = verificationCodeService.checkCode(request.getEmail(), request.getVerificationCode());
        if (!validCode) {
            return ResponseEntity.badRequest().body("Mã xác minh không đúng hoặc đã hết hạn");
        }

        // Không xóa mã ở đây nữa
        return ResponseEntity.ok("Mã xác minh hợp lệ");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không tồn tại");
        }

        boolean validCode = verificationCodeService.checkCode(request.getEmail(), request.getVerificationCode());
        if (!validCode) {
            return ResponseEntity.badRequest().body("Mã xác minh không đúng hoặc đã hết hạn");
        }

        User user = userOptional.get();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        verificationCodeService.removeCode(request.getEmail()); // Xóa mã khi đổi thành công

        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}


// Các lớp request DTO
class ForgotPasswordRequest {
    private String email;
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}

class VerifyCodeRequest {
    private String email;
    private String verificationCode;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
}

class ResetPasswordRequest {
    private String email;
    private String verificationCode;
    private String newPassword;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
