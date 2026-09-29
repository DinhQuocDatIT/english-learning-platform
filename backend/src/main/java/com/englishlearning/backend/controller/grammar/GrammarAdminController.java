package com.englishlearning.backend.controller.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarRoadmapRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarTopicRejectRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarRoadmapResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicReviewResponse;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.grammar.GrammarAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/grammar")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class GrammarAdminController {

    private final GrammarAdminService grammarAdminService;

    // =====================================================
    // ROADMAP
    // =====================================================

    @GetMapping("/roadmaps")
    public ResponseEntity<ApiResponse<List<GrammarRoadmapResponse>>> getAllRoadmaps() {
        List<GrammarRoadmapResponse> response = grammarAdminService.getAllRoadmaps();
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy danh sách lộ trình thành công", response));
    }

    @GetMapping("/roadmaps/{id}")
    public ResponseEntity<ApiResponse<GrammarRoadmapResponse>> getRoadmapById(
            @PathVariable Long id) {
        GrammarRoadmapResponse response = grammarAdminService.getRoadmapById(id);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy chi tiết lộ trình thành công", response));
    }

    @PostMapping("/roadmaps")
    public ResponseEntity<ApiResponse<GrammarRoadmapResponse>> createRoadmap(
            @Valid @RequestBody GrammarRoadmapRequest request) {
        GrammarRoadmapResponse response = grammarAdminService.createRoadmap(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                201, "Tạo lộ trình thành công", response));
    }

    @PutMapping("/roadmaps/{id}")
    public ResponseEntity<ApiResponse<GrammarRoadmapResponse>> updateRoadmap(
            @PathVariable Long id,
            @Valid @RequestBody GrammarRoadmapRequest request) {
        GrammarRoadmapResponse response = grammarAdminService.updateRoadmap(id, request);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Cập nhật lộ trình thành công", response));
    }

    @DeleteMapping("/roadmaps/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoadmap(@PathVariable Long id) {
        grammarAdminService.deleteRoadmap(id);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Xóa lộ trình thành công", null));
    }

    // =====================================================
    // TOPIC
    // =====================================================

    @GetMapping("/roadmaps/{roadmapId}/topics")
    public ResponseEntity<ApiResponse<List<GrammarTopicResponse>>> getTopicsByRoadmap(
            @PathVariable Long roadmapId) {
        List<GrammarTopicResponse> response =
                grammarAdminService.getTopicsByRoadmap(roadmapId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy danh sách chủ điểm thành công", response));
    }

    @GetMapping("/topics/{topicId}")
    public ResponseEntity<ApiResponse<GrammarTopicResponse>> getTopicById(
            @PathVariable Long topicId) {
        GrammarTopicResponse response = grammarAdminService.getTopicById(topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy chi tiết chủ điểm thành công", response));
    }

    @PostMapping("/topics/{topicId}/publish")
    public ResponseEntity<ApiResponse<GrammarTopicResponse>> publishTopic(
            @PathVariable Long topicId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long adminId = userDetails.getUser().getId();
        GrammarTopicResponse response =
                grammarAdminService.publishTopic(adminId, topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Publish chủ điểm thành công", response));
    }

    @PostMapping("/topics/{topicId}/unpublish")
    public ResponseEntity<ApiResponse<GrammarTopicResponse>> unpublishTopic(
            @PathVariable Long topicId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long adminId = userDetails.getUser().getId();
        GrammarTopicResponse response =
                grammarAdminService.unpublishTopic(adminId, topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Ẩn chủ điểm thành công", response));
    }

    // =====================================================
    // REJECT (MỚI)
    // =====================================================
    @PostMapping("/topics/{topicId}/reject")
    public ResponseEntity<ApiResponse<GrammarTopicResponse>> rejectTopic(
            @PathVariable Long topicId,
            @RequestBody GrammarTopicRejectRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long adminId = userDetails.getUser().getId();
        GrammarTopicResponse response =
                grammarAdminService.rejectTopic(adminId, topicId, request.getReason());
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Từ chối chủ điểm thành công", response));
    }

    // =====================================================
    // HISTORY (MỚI)
    // =====================================================
    @GetMapping("/topics/{topicId}/history")
    public ResponseEntity<ApiResponse<List<GrammarTopicReviewResponse>>> getTopicHistory(
            @PathVariable Long topicId) {
        List<GrammarTopicReviewResponse> response =
                grammarAdminService.getTopicHistory(topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy lịch sử duyệt thành công", response));
    }
}