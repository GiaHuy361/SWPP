package com.example.SWPP.repository;

import com.example.SWPP.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    @Query("SELECT c FROM Course c WHERE c.recommendedMinScore <= :minScore " +
            "AND c.recommendedMaxScore >= :maxScore " +
            "AND c.level = :level")
    List<Course> findByRecommendedMinScoreLessThanEqualAndRecommendedMaxScoreGreaterThanEqualAndLevel(
            @Param("minScore") Integer minScore,
            @Param("maxScore") Integer maxScore,
            @Param("level") String level);
}