package com.example.SWPP.repository;

import com.example.SWPP.entity.SurveyAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SurveyAnswerRepository extends JpaRepository<SurveyAnswer, Long> {
    List<SurveyAnswer> findByResponseId(Long responseId);
}