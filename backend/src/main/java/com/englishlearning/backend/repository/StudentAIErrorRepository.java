package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.StudentAIError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAIErrorRepository extends JpaRepository<StudentAIError, Long> {


    Optional<StudentAIError> findByStudentIdAndWeaknessKey(Long studentId, String weaknessKey);

    // Danh sách weakness của student, sắp theo mastery thấp trước
    List<StudentAIError> findByStudentIdOrderByMasteryScoreAsc(Long studentId);

    // Lấy điểm yếu của student (masteryScore < threshold)
    @Query("SELECT e FROM StudentAIError e WHERE e.student.id = :studentId AND e.masteryScore < :threshold ORDER BY e.masteryScore ASC")
    List<StudentAIError> findWeaknessesByStudentId(@Param("studentId") Long studentId, @Param("threshold") int threshold);

    // Top 5 điểm yếu nhất
    List<StudentAIError> findTop5ByStudentIdOrderByMasteryScoreAsc(Long studentId);
}