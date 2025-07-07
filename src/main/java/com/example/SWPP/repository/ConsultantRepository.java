package com.example.SWPP.repository;

import com.example.SWPP.entity.Consultant;
import com.example.SWPP.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
    Optional<Consultant> findByUser(User user);
}