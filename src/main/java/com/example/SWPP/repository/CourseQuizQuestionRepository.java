package com.example.SWPP.repository;

import com.example.SWPP.entity.CourseQuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseQuizQuestionRepository extends JpaRepository<CourseQuizQuestion, Long> {
    List<CourseQuizQuestion> findByQuizId(Long quizId);
}