package com.example.SWPP.repository;

import com.example.SWPP.entity.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    @Query("SELECT p FROM UserLessonProgress p JOIN p.lesson l JOIN l.module m JOIN m.course c WHERE p.user.userId = :userId AND c.id = :courseId")
    List<UserLessonProgress> findByUser_UserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);
}