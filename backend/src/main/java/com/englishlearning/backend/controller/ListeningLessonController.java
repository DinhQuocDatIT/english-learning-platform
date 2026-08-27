package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.ListeningLessonCreateRequest;
import com.englishlearning.backend.dto.request.UpdateListeningLessonRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.ListeningLessonResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.ListeningLessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listening-lessons")
@RequiredArgsConstructor
public class ListeningLessonController {

    private final ListeningLessonService listeningLessonService;

    // =========================
    // TEACHER - CREATE
    // =========================

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ListeningLessonResponse>> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @ModelAttribute ListeningLessonCreateRequest request
    ) {

        ListeningLessonResponse response =
                listeningLessonService.create(
                        userDetails.getUser().getId(),
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Tạo bài nghe thành công",
                        response
                )
        );
    }

    // =========================
    // TEACHER - UPDATE
    // =========================
    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping(
            value = "/{lessonId}",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<ApiResponse<ListeningLessonResponse>> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long lessonId,
            @Valid @ModelAttribute UpdateListeningLessonRequest request
    ) {

        ListeningLessonResponse response =
                listeningLessonService.update(
                        userDetails.getUser().getId(),
                        lessonId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Cập nhật bài nghe thành công",
                        response
                )
        );
    }

    // =========================
    // TEACHER - MY LESSONS
    // =========================

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ListeningLessonResponse>>> getMyLessons(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        List<ListeningLessonResponse> response =
                listeningLessonService.getMyLessons(
                        userDetails.getUser().getId()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách bài nghe thành công",
                        response
                )
        );
    }
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/topic/{topicId}/my")
    public ResponseEntity<ApiResponse<List<ListeningLessonResponse>>> getMyLessonsByTopic(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long topicId
    ) {
        List<ListeningLessonResponse> response =
                listeningLessonService.getMyLessonsByTopic(
                        userDetails.getUser().getId(),
                        topicId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách bài nghe thành công",
                        response
                )
        );
    }
    // =========================
    // TEACHER - SUBMIT
    // =========================

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/{lessonId}/submit")
    public ResponseEntity<ApiResponse<ListeningLessonResponse>> submitForReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long lessonId
    ) {

        ListeningLessonResponse response =
                listeningLessonService.submitForReview(
                        userDetails.getUser().getId(),
                        lessonId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Gửi bài nghe xét duyệt thành công",
                        response
                )
        );
    }

    // =========================
    // ADMIN - GET ALL
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<ListeningLessonResponse>>> getAll() {

        List<ListeningLessonResponse> response =
                listeningLessonService.getAll();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách bài nghe thành công",
                        response
                )
        );
    }

    // =========================
    // ADMIN - APPROVE
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{lessonId}/approve")
    public ResponseEntity<ApiResponse<ListeningLessonResponse>> approve(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long lessonId
    ) {

        ListeningLessonResponse response =
                listeningLessonService.approve(
                        userDetails.getUser().getId(),
                        lessonId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Duyệt bài nghe thành công",
                        response
                )
        );
    }

    // =========================
    // ADMIN - PUBLISH
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{lessonId}/publish")
    public ResponseEntity<ApiResponse<ListeningLessonResponse>> publish(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long lessonId
    ) {

        ListeningLessonResponse response =
                listeningLessonService.publish(
                        userDetails.getUser().getId(),
                        lessonId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Phát hành bài nghe thành công",
                        response
                )
        );
    }

    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{lessonId}")
    public ResponseEntity<ApiResponse<ListeningLessonResponse>> getById(
            @PathVariable Long lessonId
    ) {

        ListeningLessonResponse response =
                listeningLessonService.getById(lessonId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy thông tin bài nghe thành công",
                        response
                )
        );
    }

    // =========================
    // GET BY TOPIC
    // =========================

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<ApiResponse<List<ListeningLessonResponse>>> getByTopic(
            @PathVariable Long topicId
    ) {

        List<ListeningLessonResponse> response =
                listeningLessonService.getByTopic(topicId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách bài nghe của topic thành công",
                        response
                )
        );
    }

    // =========================
    // GET PUBLISHED BY TOPIC
    // =========================

    @GetMapping("/topic/{topicId}/published")
    public ResponseEntity<ApiResponse<List<ListeningLessonResponse>>>
    getPublishedByTopic(
            @PathVariable Long topicId
    ) {

        List<ListeningLessonResponse> response =
                listeningLessonService.getPublishedByTopic(topicId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy bài nghe đã phát hành thành công",
                        response
                )
        );
    }
}