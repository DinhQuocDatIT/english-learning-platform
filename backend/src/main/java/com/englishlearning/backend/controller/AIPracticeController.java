package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.CreatePracticeRequest;
import com.englishlearning.backend.dto.request.SubmitAnswerRequest;
import com.englishlearning.backend.dto.response.*;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.PracticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai/practice")
@RequiredArgsConstructor
public class AIPracticeController {

    private final PracticeService practiceService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PracticeChatResponse>> createPractice(
            @Valid @RequestBody CreatePracticeRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();  // ✅ Lấy userId từ token
        log.info("Creating practice for user: {}", userId);

        PracticeChatResponse response = practiceService.createPractice(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Tạo practice thành công", response));
    }

    @PostMapping("/{chatId}/answer")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<EvaluationResponse>> submitAnswer(
            @PathVariable Long chatId,
            @Valid @RequestBody SubmitAnswerRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Submitting answer for user: {}, turn: {}", userId, request.getTurnId());

        EvaluationResponse response = practiceService.submitAnswer(userId, request);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Nộp câu trả lời thành công", response)
        );
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<PracticeChatResponse>>> getPracticeHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting practice history for user: {}", userId);

        List<PracticeChatResponse> response = practiceService.getPracticeHistory(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy lịch sử practice thành công", response)
        );
    }

    @GetMapping("/{chatId}/result")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PracticeResultResponse>> getPracticeResult(
            @PathVariable Long chatId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting practice result for user: {}, chat: {}", userId, chatId);

        PracticeResultResponse response = practiceService.getPracticeResult(chatId, userId);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy kết quả practice thành công", response)
        );
    }

    @GetMapping("/{chatId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PracticeChatResponse>> getPracticeChat(
            @PathVariable Long chatId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting practice chat for user: {}, chat: {}", userId, chatId);

        PracticeChatResponse response = practiceService.getPracticeChat(chatId, userId);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy thông tin practice thành công", response)
        );
    }
    @GetMapping("/weaknesses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentWeaknessResponse>>> getStudentWeaknesses(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting student weaknesses for user: {}", userId);

        List<StudentWeaknessResponse> response = practiceService.getStudentWeaknessesWithDetails(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy danh sách điểm yếu thành công", response)
        );
    }
}