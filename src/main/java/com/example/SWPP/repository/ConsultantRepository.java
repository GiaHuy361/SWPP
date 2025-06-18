package com.example.SWPP.repository;

import com.example.SWPP.entity.Consultant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
}