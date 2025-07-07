package com.example.SWPP.repository;

import com.example.SWPP.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    long countByProgramProgramId(Long programId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.program.programId = :programId")
    Optional<Double> findAverageRatingByProgramId(Long programId);
}