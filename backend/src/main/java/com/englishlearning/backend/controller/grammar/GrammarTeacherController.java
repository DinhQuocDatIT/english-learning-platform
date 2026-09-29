package com.englishlearning.backend.controller.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarEditRequestCreateRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarTheoryCreateRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarTopicRequest;
import com.englishlearning.backend.dto.grammar.response.*;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.grammar.GrammarEditRequestService;
import com.englishlearning.backend.service.grammar.GrammarTeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teacher/grammar")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
public class GrammarTeacherController {

    private final GrammarTeacherService grammarTeacherService;
    private final GrammarEditRequestService editRequestService;

    // =====================================================
    // ROADMAP
    // =====================================================

    @GetMapping("/roadmaps")
    public ResponseEntity<ApiResponse<List<GrammarRoadmapResponse>>> getRoadmapsForTeacher(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        List<GrammarRoadmapResponse> response =
                grammarTeacherService.getAllRoadmapsForTeacher(teacherId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy danh sách lộ trình thành công", response));
    }

    // =====================================================
    // TOPIC
    // =====================================================

    @GetMapping("/topics")
    public ResponseEntity<ApiResponse<List<GrammarTopicResponse>>> getMyTopics(
            @RequestParam(required = false) Long roadmapId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        List<GrammarTopicResponse> response =
                grammarTeacherService.getMyTopics(teacherId, roadmapId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy danh sách chủ điểm thành công", response));
    }

    @GetMapping("/topics/{topicId}")
    public ResponseEntity<ApiResponse<GrammarTopicDetailResponse>> getTopicForEdit(
            @PathVariable Long topicId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        GrammarTopicDetailResponse response =
                grammarTeacherService.getTopicForEdit(teacherId, topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy chi tiết chủ điểm thành công", response));
    }

    @PostMapping("/topics")
    public ResponseEntity<ApiResponse<GrammarTopicResponse>> createTopic(
            @Valid @RequestBody GrammarTopicRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        GrammarTopicResponse response =
                grammarTeacherService.createTopic(teacherId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                201, "Tạo chủ điểm thành công", response));
    }

    @PutMapping("/topics/{topicId}")
    public ResponseEntity<ApiResponse<GrammarTopicResponse>> updateTopic(
            @PathVariable Long topicId,
            @Valid @RequestBody GrammarTopicRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        GrammarTopicResponse response =
                grammarTeacherService.updateTopic(teacherId, topicId, request);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Cập nhật chủ điểm thành công", response));
    }

    @DeleteMapping("/topics/{topicId}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(
            @PathVariable Long topicId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        grammarTeacherService.deleteTopic(teacherId, topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Xóa chủ điểm thành công", null));
    }

    @PostMapping("/topics/{topicId}/submit")
    public ResponseEntity<ApiResponse<GrammarTopicResponse>> submitTopic(
            @PathVariable Long topicId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        GrammarTopicResponse response =
                grammarTeacherService.submitTopicForReview(teacherId, topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Gửi duyệt chủ điểm thành công", response));
    }

    // =====================================================
    // REVIEW HISTORY
    // =====================================================

    @GetMapping("/topics/{topicId}/history")
    public ResponseEntity<ApiResponse<List<GrammarTopicReviewResponse>>> getTopicHistory(
            @PathVariable Long topicId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        List<GrammarTopicReviewResponse> response =
                grammarTeacherService.getTopicHistory(teacherId, topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy lịch sử duyệt thành công", response));
    }

    // =====================================================
    // EDIT REQUEST
    // =====================================================

    @PostMapping("/topics/{topicId}/request-edit")
    public ResponseEntity<ApiResponse<GrammarEditRequestResponse>> requestEdit(
            @PathVariable Long topicId,
            @Valid @RequestBody GrammarEditRequestCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        GrammarEditRequestResponse response =
                editRequestService.createRequest(teacherId, topicId, request.getReason());
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                201, "Gửi yêu cầu chỉnh sửa thành công", response));
    }

    @GetMapping("/topics/{topicId}/edit-requests")
    public ResponseEntity<ApiResponse<List<GrammarEditRequestResponse>>> getEditRequests(
            @PathVariable Long topicId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        List<GrammarEditRequestResponse> response =
                editRequestService.getRequestsByTopicForTeacher(teacherId, topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy lịch sử yêu cầu thành công", response));
    }

    // =====================================================
    // THEORY
    // =====================================================

    @GetMapping("/topics/{topicId}/theories")
    public ResponseEntity<ApiResponse<List<GrammarTheoryResponse>>> getTheories(
            @PathVariable Long topicId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        List<GrammarTheoryResponse> response =
                grammarTeacherService.getTheoriesForEdit(teacherId, topicId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Lấy danh sách lý thuyết thành công", response));
    }

    @PostMapping("/theories")
    public ResponseEntity<ApiResponse<GrammarTheoryResponse>> createTheory(
            @Valid @RequestBody GrammarTheoryCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        GrammarTheoryResponse response =
                grammarTeacherService.createTheory(teacherId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                201, "Tạo lý thuyết thành công", response));
    }

    @PostMapping("/topics/{topicId}/theories/batch")
    public ResponseEntity<ApiResponse<List<GrammarTheoryResponse>>> createTheoriesBatch(
            @PathVariable Long topicId,
            @Valid @RequestBody GrammarTheoryCreateRequest.BatchCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        List<GrammarTheoryResponse> response =
                grammarTeacherService.createTheoriesBatch(teacherId, topicId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                201, "Tạo " + response.size() + " lý thuyết thành công", response));
    }

    @PutMapping("/theories/{theoryId}")
    public ResponseEntity<ApiResponse<GrammarTheoryResponse>> updateTheory(
            @PathVariable Long theoryId,
            @Valid @RequestBody GrammarTheoryCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        GrammarTheoryResponse response =
                grammarTeacherService.updateTheory(teacherId, theoryId, request);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Cập nhật lý thuyết thành công", response));
    }

    @DeleteMapping("/theories/{theoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteTheory(
            @PathVariable Long theoryId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long teacherId = userDetails.getUser().getId();
        grammarTeacherService.deleteTheory(teacherId, theoryId);
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Xóa lý thuyết thành công", null));
    }
}