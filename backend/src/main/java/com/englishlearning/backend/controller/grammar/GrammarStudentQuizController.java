package com.englishlearning.backend.controller.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarQuizSaveAnswerRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarQuizAttemptResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarQuizResponse;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.grammar.GrammarQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student/grammar")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class GrammarStudentQuizController {

    private final GrammarQuizService quizService;

    // Lấy chi tiết quiz để làm bài (không có đáp án)
    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<GrammarQuizResponse>> getQuizForPlay(
            @PathVariable Long quizId) {
        GrammarQuizResponse res = quizService.getQuizForPlay(quizId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy đề thành công", res));
    }

    // Bắt đầu hoặc resume attempt
    @PostMapping("/quizzes/{quizId}/start")
    public ResponseEntity<ApiResponse<GrammarQuizAttemptResponse>> startOrResume(
            @PathVariable Long quizId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        GrammarQuizAttemptResponse res = quizService.startOrResumeAttempt(userId, quizId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Bắt đầu làm bài", res));
    }

    // Load attempt hiện tại của quiz (IN_PROGRESS hoặc COMPLETED mới nhất)
    @GetMapping("/quizzes/{quizId}/attempt")
    public ResponseEntity<ApiResponse<GrammarQuizAttemptResponse>> getAttemptForQuiz(
            @PathVariable Long quizId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        GrammarQuizAttemptResponse res = quizService.getAttemptForQuiz(userId, quizId);
        return ResponseEntity.ok(new ApiResponse<>(200,
                res == null ? "Chưa có lượt làm bài nào" : "Lấy lượt làm bài thành công",
                res));
    }

    // Lưu 1 câu trả lời
    @PutMapping("/attempts/{attemptId}/answer")
    public ResponseEntity<ApiResponse<GrammarQuizAttemptResponse>> saveAnswer(
            @PathVariable Long attemptId,
            @Valid @RequestBody GrammarQuizSaveAnswerRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        GrammarQuizAttemptResponse res = quizService.saveAnswer(userId, attemptId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, "Đã lưu đáp án", res));
    }

    // Nộp bài
    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<ApiResponse<GrammarQuizAttemptResponse>> submitAttempt(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        GrammarQuizAttemptResponse res = quizService.submitAttempt(userId, attemptId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Nộp bài thành công", res));
    }

    // Load 1 attempt cụ thể
    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<ApiResponse<GrammarQuizAttemptResponse>> getAttemptById(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        GrammarQuizAttemptResponse res = quizService.getAttemptById(userId, attemptId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy kết quả thành công", res));
    }
}