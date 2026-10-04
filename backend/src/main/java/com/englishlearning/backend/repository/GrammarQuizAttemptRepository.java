package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarQuizAttempt;
import com.englishlearning.backend.enums.GrammarQuizAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarQuizAttemptRepository extends JpaRepository<GrammarQuizAttempt, Long> {

    /**
     * Lấy tất cả attempt theo (student, quiz, status), sắp xếp id DESC.
     * Dùng List thay vì Optional để tránh NonUniqueResultException.
     */
    List<GrammarQuizAttempt> findByStudentIdAndQuizIdAndStatusOrderByIdDesc(
            Long studentId, Long quizId, GrammarQuizAttemptStatus status);

    /**
     * Lấy tất cả attempt COMPLETED, mới nhất trước.
     */
    List<GrammarQuizAttempt> findByStudentIdAndQuizIdAndStatusOrderByCompletedAtDesc(
            Long studentId, Long quizId, GrammarQuizAttemptStatus status);

    int countByStudentIdAndQuizId(Long studentId, Long quizId);
}