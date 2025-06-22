package com.example.SWPP.repository;

import com.example.SWPP.entity.CourseQuizSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseQuizSubmissionRepository extends JpaRepository<CourseQuizSubmission, Long> {
    List<CourseQuizSubmission> findByUser_UserIdAndQuizId(Long userId, Long quizId);
}