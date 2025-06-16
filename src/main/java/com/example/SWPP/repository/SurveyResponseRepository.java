package com.example.SWPP.repository;

import com.example.SWPP.entity.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {

    // Tìm phản hồi theo surveyId và userId
    @Query("SELECT r FROM SurveyResponse r WHERE r.survey.id = :surveyId AND r.user.userId = :userId")
    List<SurveyResponse> findBySurveyIdAndUserId(@Param("surveyId") Long surveyId, @Param("userId") Long userId);

    // Tìm tất cả phản hồi theo surveyId
    @Query("SELECT r FROM SurveyResponse r WHERE r.survey.id = :surveyId")
    List<SurveyResponse> findBySurveyId(@Param("surveyId") Long surveyId);

    // Tìm tất cả phản hồi theo userId
    @Query("SELECT r FROM SurveyResponse r WHERE r.user.userId = :userId")
    List<SurveyResponse> findByUserId(@Param("userId") Long userId);

    // Tìm phản hồi theo surveyId trong danh sách surveyIds và userId
    @Query("SELECT r FROM SurveyResponse r WHERE r.survey.id IN :surveyIds AND r.user.userId = :userId")
    List<SurveyResponse> findBySurveyIdsAndUserId(@Param("surveyIds") List<Long> surveyIds, @Param("userId") Long userId);

    // Tìm phản hồi theo khoảng thời gian
    @Query("SELECT r FROM SurveyResponse r WHERE r.submittedAt BETWEEN :startDate AND :endDate")
    List<SurveyResponse> findBySubmittedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Thống kê số lượng phản hồi theo riskLevel cho một surveyId
    @Query("SELECT r.riskLevel, COUNT(r) FROM SurveyResponse r WHERE r.survey.id = :surveyId GROUP BY r.riskLevel")
    List<Object[]> countByRiskLevelAndSurveyId(@Param("surveyId") Long surveyId);

    // Tính trung bình totalScore theo surveyId và userId
    @Query("SELECT AVG(r.totalScore) FROM SurveyResponse r WHERE r.survey.id = :surveyId AND r.user.userId = :userId")
    Double calculateAverageScoreBySurveyIdAndUserId(@Param("surveyId") Long surveyId, @Param("userId") Long userId);
}