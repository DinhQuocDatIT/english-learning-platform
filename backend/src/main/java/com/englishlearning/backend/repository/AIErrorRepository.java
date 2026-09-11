package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIErrorRepository extends JpaRepository<AIError, Long> {
    List<AIError> findByEvaluationId(Long evaluationId);
    long countByEvaluationId(Long evaluationId);
    @Query("""
        SELECT e FROM AIError e
        JOIN e.evaluation ev
        JOIN ev.answer a
        JOIN a.turn t
        JOIN t.practiceChat pc
        WHERE pc.student.id = :studentId
          AND e.errorType = :errorType
        ORDER BY e.createdAt DESC
    """)
    List<AIError> findLatestByStudentIdAndErrorType(
            @Param("studentId") Long studentId,
            @Param("errorType") String errorType
    );
    /**
     * Lấy TẤT CẢ lỗi của student trong 1 practice chat
     * (dùng để thống kê common errors có ý nghĩa)
     */
    @Query("""
        SELECT e FROM AIError e
        JOIN FETCH e.evaluation ev
        JOIN ev.answer a
        JOIN a.turn t
        JOIN t.practiceChat pc
        WHERE pc.id = :practiceChatId
        ORDER BY e.createdAt DESC
    """)
    List<AIError> findAllByPracticeChatId(@Param("practiceChatId") Long practiceChatId);
}