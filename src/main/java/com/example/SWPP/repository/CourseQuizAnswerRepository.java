package com.example.SWPP.repository;

import com.example.SWPP.entity.CourseQuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseQuizAnswerRepository extends JpaRepository<CourseQuizAnswer, Long> {
    List<CourseQuizAnswer> findByQuestionId(Long questionId);
}