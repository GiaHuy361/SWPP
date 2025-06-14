package com.example.SWPP.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
// Phần này verifi cho phần quên mk kh cần đụng
public class VerificationCodeService {

    private static class VerificationData {
        String code;
        Instant expiryTime;

        VerificationData(String code, Instant expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }

    private final Map<String, VerificationData> codeStorage = new ConcurrentHashMap<>();
    private final long CODE_VALID_DURATION_SECONDS = 60; // 60 giây (1 phút)

    public void storeCode(String email, String code) {
        Instant expiry = Instant.now().plusSeconds(CODE_VALID_DURATION_SECONDS);
        codeStorage.put(email, new VerificationData(code, expiry));
    }

    // Kiểm tra mã, KHÔNG xóa
    public boolean checkCode(String email, String code) {
        VerificationData data = codeStorage.get(email);
        if (data == null) return false;
        if (Instant.now().isAfter(data.expiryTime)) {
            codeStorage.remove(email);
            return false; // Mã hết hạn
        }
        return data.code.equals(code);
    }

    // Xóa mã sau khi đổi mật khẩu thành công
    public void removeCode(String email) {
        codeStorage.remove(email);
    }
}
