package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarQuizAttempt;
import com.englishlearning.backend.enums.GrammarQuizAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrammarQuizAttemptRepository extends JpaRepository<GrammarQuizAttempt, Long> {

    // Lấy attempt đang làm dở (nếu có) — mỗi student chỉ có 1 attempt IN_PROGRESS / quiz
    Optional<GrammarQuizAttempt> findByStudentIdAndQuizIdAndStatus(
            Long studentId, Long quizId, GrammarQuizAttemptStatus status);

    // Lịch sử tất cả attempt COMPLETED của student với quiz
    List<GrammarQuizAttempt> findByStudentIdAndQuizIdAndStatusOrderByCompletedAtDesc(
            Long studentId, Long quizId, GrammarQuizAttemptStatus status);

    int countByStudentIdAndQuizId(Long studentId, Long quizId);
}