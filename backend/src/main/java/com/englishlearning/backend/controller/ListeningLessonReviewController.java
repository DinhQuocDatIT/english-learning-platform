package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.ListeningLessonReviewRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.ListeningLessonReviewResponse;
import com.englishlearning.backend.service.ListeningLessonReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listening-lesson-reviews")
@RequiredArgsConstructor
public class ListeningLessonReviewController {

    private final ListeningLessonReviewService listeningLessonReviewService;

    // ===== GET ALL =====
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ListeningLessonReviewResponse>>> getAll() {
        List<ListeningLessonReviewResponse> response = listeningLessonReviewService.getAll();
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy danh sách lịch sử duyệt thành công", response)
        );
    }

    // ===== GET BY LESSON ID =====
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<ListeningLessonReviewResponse>>> getByLesson(
            @PathVariable Long lessonId
    ) {
        List<ListeningLessonReviewResponse> response = listeningLessonReviewService.getByLessonId(lessonId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy lịch sử duyệt của bài nghe thành công", response)
        );
    }

    // ===== GET BY ID =====
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")  // ✅ THÊM PHÂN QUYỀN
    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ListeningLessonReviewResponse>> getById(
            @PathVariable Long reviewId
    ) {
        ListeningLessonReviewResponse response = listeningLessonReviewService.getById(reviewId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy lịch sử duyệt thành công", response)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<ListeningLessonReviewResponse>> create(
            @Valid @RequestBody ListeningLessonReviewRequest request
    ) {
        ListeningLessonReviewResponse response = listeningLessonReviewService.create(request);
        return ResponseEntity.ok(
                new ApiResponse<>(201, "Tạo lịch sử duyệt thành công", response)
        );
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long reviewId
    ) {
        listeningLessonReviewService.delete(reviewId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Xóa lịch sử duyệt thành công", null)
        );
    }
}