package com.example.SWPP.repository;

import com.example.SWPP.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    // --- Bước 3: Phương thức cho Google Login ---
    Optional<User> findByGoogleId(String googleId);

    // Tìm user theo email hoặc googleId
    Optional<User> findByEmailOrGoogleId(String email, String googleId);



}