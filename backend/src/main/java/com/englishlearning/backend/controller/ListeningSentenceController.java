package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.ListeningSentenceRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.ListeningSentenceResponse;
import com.englishlearning.backend.service.ListeningSentenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listening-sentences")
@RequiredArgsConstructor
public class ListeningSentenceController {

    private final ListeningSentenceService listeningSentenceService;

    // ===== GET ALL BY LESSON =====
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<ListeningSentenceResponse>>> getByLesson(
            @PathVariable Long lessonId
    ) {
        List<ListeningSentenceResponse> response =
                listeningSentenceService.getByLessonId(lessonId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy danh sách câu hỏi thành công", response)
        );
    }

    // ===== GET BY ID =====
    @GetMapping("/{sentenceId}")
    public ResponseEntity<ApiResponse<ListeningSentenceResponse>> getById(
            @PathVariable Long sentenceId
    ) {
        ListeningSentenceResponse response =
                listeningSentenceService.getById(sentenceId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy câu hỏi thành công", response)
        );
    }

    // ===== TEACHER - CREATE =====
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public ResponseEntity<ApiResponse<ListeningSentenceResponse>> create(
            @Valid @RequestBody ListeningSentenceRequest request
    ) {
        ListeningSentenceResponse response =
                listeningSentenceService.create(request);
        return ResponseEntity.ok(
                new ApiResponse<>(201, "Tạo câu hỏi thành công", response)
        );
    }

    // ===== TEACHER - UPDATE =====
    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/{sentenceId}")
    public ResponseEntity<ApiResponse<ListeningSentenceResponse>> update(
            @PathVariable Long sentenceId,
            @Valid @RequestBody ListeningSentenceRequest request
    ) {
        ListeningSentenceResponse response =
                listeningSentenceService.update(sentenceId, request);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Cập nhật câu hỏi thành công", response)
        );
    }

    // ===== TEACHER - DELETE =====
    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/{sentenceId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long sentenceId
    ) {
        listeningSentenceService.delete(sentenceId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Xóa câu hỏi thành công", null)
        );
    }

    // ===== TEACHER - REORDER =====
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/reorder/{lessonId}")
    public ResponseEntity<ApiResponse<List<ListeningSentenceResponse>>> reorder(
            @PathVariable Long lessonId,
            @RequestBody List<Long> sentenceIds
    ) {
        List<ListeningSentenceResponse> response =
                listeningSentenceService.reorderSentences(lessonId, sentenceIds);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Sắp xếp câu hỏi thành công", response)
        );
    }
}