package com.example.SWPP.repository;

import com.example.SWPP.entity.CommunicationProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommunicationProgramRepository extends JpaRepository<CommunicationProgram, Long> {
    long countByStatusAndStartDateBeforeAndEndDateAfterOrEndDateIsNull(String status, LocalDateTime startDate, LocalDateTime endDate);

    List<CommunicationProgram> findByStatusAndEndDateBefore(String status, LocalDateTime endDate);
    /**
     * Lấy danh sách ID chương trình mà user đã tham gia
     * @param userId ID của người dùng
     * @return Danh sách ID các chương trình mà người dùng đã tham gia
     */
    @Query("SELECT cp.programId FROM CommunicationProgram cp WHERE :userId MEMBER OF cp.participants")
    List<Long> findProgramIdsByParticipantId(@Param("userId") Long userId);

    /**
     * Kiểm tra xem một user có tham gia chương trình không
     * @param programId ID của chương trình
     * @param userId ID của người dùng
     * @return true nếu người dùng đã tham gia chương trình, ngược lại false
     */
    @Query("SELECT CASE WHEN COUNT(cp) > 0 THEN true ELSE false END FROM CommunicationProgram cp WHERE cp.programId = :programId AND :userId MEMBER OF cp.participants")
    boolean existsByProgramIdAndParticipantId(@Param("programId") Long programId, @Param("userId") Long userId);

}