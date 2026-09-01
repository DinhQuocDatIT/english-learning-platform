package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.StudentAIError;
import com.englishlearning.backend.enums.ErrorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAIErrorRepository extends JpaRepository<StudentAIError, Long> {
    Optional<StudentAIError> findByStudentIdAndErrorKey(Long studentId, String errorKey);
    List<StudentAIError> findByStudentIdOrderByMasteryScoreAsc(Long studentId);
    // Lấy điểm yếu của student (masteryScore < 50)
    @Query("SELECT e FROM StudentAIError e WHERE e.student.id = :studentId AND e.masteryScore < :threshold ORDER BY e.masteryScore ASC")
    List<StudentAIError> findWeaknessesByStudentId(@Param("studentId") Long studentId, @Param("threshold") int threshold);
    // Lấy top N điểm yếu nhất
    List<StudentAIError> findTop5ByStudentIdOrderByMasteryScoreAsc(Long studentId);
}