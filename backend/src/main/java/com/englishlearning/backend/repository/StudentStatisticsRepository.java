package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository CHUYÊN cho thống kê student.
 * KHÔNG đụng vào StudentRepository cũ.
 */
@Repository
public interface StudentStatisticsRepository extends JpaRepository<Student, Long> {

    // =====================================================
    // 1. RANKING
    // =====================================================

    @Query("SELECT COUNT(s) FROM Student s WHERE s.experience > :xp")
    long countHigherXp(@Param("xp") int xp);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.experience = :xp AND s.id < :studentId")
    long countSameXpLowerId(@Param("xp") int xp, @Param("studentId") Long studentId);

    @Query("SELECT COUNT(s) FROM Student s")
    long countAllStudents();

    // =====================================================
    // 2. PRACTICE STATS
    // =====================================================

    @Query("""
        SELECT COUNT(c) FROM AIPracticeChat c
        WHERE c.student.id = :studentId
          AND c.status = 'COMPLETED'
    """)
    long countCompletedSessions(@Param("studentId") Long studentId);

    @Query("""
        SELECT COUNT(c) FROM AIPracticeChat c
        WHERE c.student.id = :studentId
          AND c.status = 'IN_PROGRESS'
    """)
    long countInProgressSessions(@Param("studentId") Long studentId);

    @Query("""
        SELECT COALESCE(SUM(c.questionCount), 0) FROM AIPracticeChat c
        WHERE c.student.id = :studentId
    """)
    long sumTotalQuestions(@Param("studentId") Long studentId);

    @Query("""
        SELECT COALESCE(SUM(c.correctCount), 0) FROM AIPracticeChat c
        WHERE c.student.id = :studentId
    """)
    long sumTotalCorrect(@Param("studentId") Long studentId);

    @Query("""
        SELECT AVG(a.score) FROM AIAnswer a
        JOIN a.turn t
        JOIN t.practiceChat pc
        WHERE pc.student.id = :studentId
          AND a.score IS NOT NULL
    """)
    Double getAverageScore(@Param("studentId") Long studentId);

    // =====================================================
    // 3. LISTENING STATS
    // =====================================================

    @Query("""
        SELECT COUNT(la) FROM ListeningAnswer la
        WHERE la.student.id = :studentId
    """)
    long countListeningAnswers(@Param("studentId") Long studentId);

    @Query("""
        SELECT COUNT(la) FROM ListeningAnswer la
        WHERE la.student.id = :studentId
          AND la.isCorrect = true
    """)
    long countListeningCorrect(@Param("studentId") Long studentId);

    // =====================================================
    // 4. VOCABULARY STATS
    // =====================================================

    @Query("""
        SELECT COUNT(sv) FROM StudentVocabulary sv
        WHERE sv.student.id = :studentId
    """)
    long countVocabularyTotal(@Param("studentId") Long studentId);

    @Query("""
        SELECT COUNT(sv) FROM StudentVocabulary sv
        WHERE sv.student.id = :studentId
          AND sv.learningStatus = 'LEARNED'
    """)
    long countVocabularyLearned(@Param("studentId") Long studentId);

    @Query("""
        SELECT COUNT(sv) FROM StudentVocabulary sv
        WHERE sv.student.id = :studentId
          AND sv.learningStatus = 'LEARNING'
    """)
    long countVocabularyLearning(@Param("studentId") Long studentId);

    // =====================================================
    // 5. ERROR STATS — CHỈ ĐẾM, KHÔNG LẤY VÍ DỤ
    // =====================================================

    /**
     * Đếm số lỗi theo từng errorType
     * Trả về: [errorType, count, highSeverity, mediumSeverity, lowSeverity]
     */
    @Query("""
        SELECT e.errorType, COUNT(e),
               SUM(CASE WHEN e.severity = 'HIGH' THEN 1 ELSE 0 END),
               SUM(CASE WHEN e.severity = 'MEDIUM' THEN 1 ELSE 0 END),
               SUM(CASE WHEN e.severity = 'LOW' THEN 1 ELSE 0 END)
        FROM AIError e
        JOIN e.evaluation ev
        JOIN ev.answer a
        JOIN a.turn t
        JOIN t.practiceChat pc
        WHERE pc.student.id = :studentId
        GROUP BY e.errorType
        ORDER BY COUNT(e) DESC
    """)
    List<Object[]> countErrorsByType(@Param("studentId") Long studentId);

    // =====================================================
    // 6. ACTIVITY — ĐẾM SỐ CÂU HỎI THEO NGÀY
    // =====================================================

    /**
     * Đếm số CÂU HỎI đã trả lời theo ngày (7 ngày gần nhất)
     * Dùng ai_answer.answered_at — chính xác hơn
     * Trả về: [date, count]
     */
    @Query(value = """
        SELECT DATE(a.answered_at) as d, COUNT(*) as cnt
        FROM ai_answer a
        JOIN ai_practice_turn t ON a.turn_id = t.id
        JOIN ai_practice_chat c ON t.practice_chat_id = c.id
        WHERE c.student_id = :studentId
          AND a.answered_at >= :from
        GROUP BY DATE(a.answered_at)
        ORDER BY d
    """, nativeQuery = true)
    List<Object[]> countQuestionsByDate(
            @Param("studentId") Long studentId,
            @Param("from") LocalDateTime from
    );

    // =====================================================
    // 7. AI USAGE STATS — CHỈ ĐẾM REQUEST
    // =====================================================

    @Query("""
        SELECT COUNT(u) FROM AIUsage u
        WHERE u.student.id = :studentId
    """)
    long countAIRequests(@Param("studentId") Long studentId);
}