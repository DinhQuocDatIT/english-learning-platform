package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarQuizRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarQuizSaveAnswerRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarQuizAttemptResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarQuizResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarQuizSummaryResponse;

import java.util.List;

public interface GrammarQuizService {

    // ===== PUBLIC (Student xem list) =====
    List<GrammarQuizSummaryResponse> getPublishedQuizzes(Long topicId, Long userId);

    // ===== STUDENT (làm bài) =====
    // Start hoặc resume attempt IN_PROGRESS
    GrammarQuizAttemptResponse startOrResumeAttempt(Long userId, Long quizId);

    // Save 1 câu — return attempt mới
    GrammarQuizAttemptResponse saveAnswer(Long userId, Long attemptId,
                                          GrammarQuizSaveAnswerRequest request);

    // Nộp bài — tính điểm
    GrammarQuizAttemptResponse submitAttempt(Long userId, Long attemptId);

    // Load attempt hiện tại (IN_PROGRESS hoặc attempt mới nhất COMPLETED)
    GrammarQuizAttemptResponse getAttemptForQuiz(Long userId, Long quizId);

    // Load 1 attempt cụ thể (để xem lại kết quả cũ)
    GrammarQuizAttemptResponse getAttemptById(Long userId, Long attemptId);

    // Load chi tiết quiz (câu hỏi, không đáp án) — để hiển thị khi đang làm
    GrammarQuizResponse getQuizForPlay(Long quizId);

    // ===== TEACHER =====
    List<GrammarQuizSummaryResponse> getQuizzesForEdit(Long teacherId, Long topicId);
    GrammarQuizResponse getQuizForEdit(Long teacherId, Long quizId);
    GrammarQuizResponse createQuiz(Long teacherId, GrammarQuizRequest request);
    GrammarQuizResponse updateQuiz(Long teacherId, Long quizId, GrammarQuizRequest request);
    void deleteQuiz(Long teacherId, Long quizId);

    // ===== ADMIN =====
    List<GrammarQuizSummaryResponse> getQuizzesForAdmin(Long topicId);
    GrammarQuizResponse getQuizForAdmin(Long quizId);
}