package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.ListeningSentenceFeedbackRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.ListeningSentenceFeedbackResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.ListeningSentenceFeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listening-sentence-feedbacks")
@RequiredArgsConstructor
public class ListeningSentenceFeedbackController {

    private final ListeningSentenceFeedbackService feedbackService;
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ResponseEntity<ApiResponse<ListeningSentenceFeedbackResponse>> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ListeningSentenceFeedbackRequest request
    ) {
        ListeningSentenceFeedbackResponse response = feedbackService.create(
                userDetails.getUser().getId(),
                request
        );
        return ResponseEntity.ok(new ApiResponse<>(200, "Tạo phản hồi thành công", response));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/{feedbackId}")
    public ResponseEntity<ApiResponse<ListeningSentenceFeedbackResponse>> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long feedbackId,
            @Valid @RequestBody ListeningSentenceFeedbackRequest request
    ) {
        ListeningSentenceFeedbackResponse response = feedbackService.update(
                userDetails.getUser().getId(),
                feedbackId,
                request
        );
        return ResponseEntity.ok(new ApiResponse<>(200, "Cập nhật phản hồi thành công", response));
    }
    @PreAuthorize("hasRole('STUDENT')")
    @DeleteMapping("/{feedbackId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long feedbackId
    ) {
        feedbackService.delete(userDetails.getUser().getId(), feedbackId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Xóa phản hồi thành công", null));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/sentence/{sentenceId}/my")
    public ResponseEntity<ApiResponse<ListeningSentenceFeedbackResponse>> getMyFeedbackBySentence(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long sentenceId
    ) {
        ListeningSentenceFeedbackResponse response = feedbackService.getByStudentAndSentence(
                userDetails.getUser().getId(),
                sentenceId
        );
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy phản hồi thành công", response));
    }
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ListeningSentenceFeedbackResponse>>> getMyFeedbacks(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<ListeningSentenceFeedbackResponse> response = feedbackService.getMyFeedbacks(
                userDetails.getUser().getId()
        );
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách phản hồi thành công", response));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<ListeningSentenceFeedbackResponse>>> getMyFeedbacksByLesson(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long lessonId
    ) {
        List<ListeningSentenceFeedbackResponse> response = feedbackService.getMyFeedbacksByLesson(
                userDetails.getUser().getId(),
                lessonId
        );
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách phản hồi thành công", response));
    }

    @GetMapping("/sentence/{sentenceId}")
    public ResponseEntity<ApiResponse<List<ListeningSentenceFeedbackResponse>>> getBySentence(
            @PathVariable Long sentenceId
    ) {
        List<ListeningSentenceFeedbackResponse> response = feedbackService.getBySentence(sentenceId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách phản hồi thành công", response));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<ListeningSentenceFeedbackResponse>>> getByLesson(
            @PathVariable Long lessonId
    ) {
        List<ListeningSentenceFeedbackResponse> response = feedbackService.getByLesson(lessonId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách phản hồi thành công", response));
    }
}