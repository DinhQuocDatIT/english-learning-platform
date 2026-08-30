package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.ListeningAnswerRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.ListeningAnswerResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.ListeningAnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/listening-answers")
@RequiredArgsConstructor
public class ListeningAnswerController {

    private final ListeningAnswerService listeningAnswerService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/answer")
    public ResponseEntity<ApiResponse<ListeningAnswerResponse>> answerQuestion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ListeningAnswerRequest request
    ) {

        ListeningAnswerResponse response = listeningAnswerService.answerQuestion(
                userDetails.getUser().getId(),
                request
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Trả lời câu hỏi thành công",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my-answers")
    public ResponseEntity<ApiResponse<List<ListeningAnswerResponse>>> getMyAnswers(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        List<ListeningAnswerResponse> response = listeningAnswerService.getStudentAnswers(
                userDetails.getUser().getId()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy lịch sử trả lời thành công",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my-answers/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<ListeningAnswerResponse>>> getMyAnswersByLesson(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long lessonId
    ) {

        List<ListeningAnswerResponse> response = listeningAnswerService.getStudentAnswersByLesson(
                userDetails.getUser().getId(),
                lessonId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy lịch sử trả lời theo bài học thành công",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/sentence/{sentenceId}")
    public ResponseEntity<ApiResponse<ListeningAnswerResponse>> getAnswerBySentence(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long sentenceId
    ) {

        ListeningAnswerResponse response = listeningAnswerService.getStudentAnswerBySentence(
                userDetails.getUser().getId(),
                sentenceId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy câu trả lời thành công",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/sentence/{sentenceId}/completed")
    public ResponseEntity<ApiResponse<Boolean>> isSentenceCompleted(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long sentenceId
    ) {

        boolean completed = listeningAnswerService.isSentenceCompleted(
                userDetails.getUser().getId(),
                sentenceId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Kiểm tra hoàn thành thành công",
                        completed
                )
        );
    }

    // ==========================================
    // API MỚI
    // ==========================================

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/reset/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<Void>> resetLessonAnswers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long lessonId
    ) {

        listeningAnswerService.resetLessonAnswers(
                userDetails.getUser().getId(),
                lessonId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Đặt lại bài học thành công. Bạn có thể làm lại từ đầu!",
                        null
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/lesson/{lessonId}/completed")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLessonProgress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long lessonId
    ) {

        boolean isCompleted = listeningAnswerService.isLessonCompleted(
                userDetails.getUser().getId(),
                lessonId
        );

        int completedCount = listeningAnswerService.getCompletedCountInLesson(
                userDetails.getUser().getId(),
                lessonId
        );

        Map<String, Object> data = new HashMap<>();
        data.put("isCompleted", isCompleted);
        data.put("completedCount", completedCount);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy tiến độ bài học thành công",
                        data
                )
        );
    }
}