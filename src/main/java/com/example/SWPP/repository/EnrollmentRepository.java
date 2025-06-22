package com.example.SWPP.repository;

import com.example.SWPP.entity.Enrollment;
import com.example.SWPP.entity.User;
import com.example.SWPP.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserAndCourse(User user, Course course);
}