package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.TopicCreateRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.TopicResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;



    @PostMapping(
            consumes = "multipart/form-data"
    )
    public ResponseEntity<ApiResponse<TopicResponse>> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @ModelAttribute TopicCreateRequest request
    ) {

        TopicResponse response =
                topicService.create(
                        userDetails.getUser().getId(),
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Tạo topic thành công",
                        response
                )
        );
    }

    @PutMapping(
            value = "/{topicId}",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<ApiResponse<TopicResponse>> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long topicId,
            @Valid @ModelAttribute TopicCreateRequest request
    ) {

        TopicResponse response =
                topicService.update(
                        userDetails.getUser().getId(),
                        topicId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Cập nhật topic thành công",
                        response
                )
        );
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getAll() {

        List<TopicResponse> response =
                topicService.getAll();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách topic thành công",
                        response
                )
        );
    }

    @PostMapping("/admin/{topicId}/publish")
    public ResponseEntity<ApiResponse<TopicResponse>> publish(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long topicId
    ) {

        TopicResponse response =
                topicService.publish(
                        userDetails.getUser().getId(),
                        topicId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Hiển thị topic thành công",
                        response
                )
        );
    }

    @PostMapping("/admin/{topicId}/hide")
    public ResponseEntity<ApiResponse<TopicResponse>> hide(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long topicId
    ) {

        TopicResponse response =
                topicService.hide(
                        userDetails.getUser().getId(),
                        topicId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Ẩn topic thành công",
                        response
                )
        );
    }



    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicResponse>>>
    getPublishedTopics() {

        List<TopicResponse> response =
                topicService.getPublishedTopics();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách topic thành công",
                        response
                )
        );
    }

    @GetMapping("/{topicId}")
    public ResponseEntity<ApiResponse<TopicResponse>> getById(
            @PathVariable Long topicId
    ) {

        TopicResponse response =
                topicService.getById(topicId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy thông tin topic thành công",
                        response
                )
        );
    }
    @GetMapping("/student")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getTopicsForStudent(
            @RequestParam(defaultValue = "newest") String sortBy
    ) {

        List<TopicResponse> response = topicService.getTopicsForStudent();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách topic thành công",
                        response
                )
        );
    }
}