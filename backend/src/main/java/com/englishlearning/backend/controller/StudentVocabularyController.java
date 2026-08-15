package com.englishlearning.backend.controller;



import com.englishlearning.backend.dto.request.SaveVocabularyRequest;
import com.englishlearning.backend.dto.request.UpdateLearningStatusRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.SavedVocabularyResponse;
import com.englishlearning.backend.enums.LearningStatus;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.StudentVocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;




@RestController
@RequestMapping("/api/v1/student-vocabularies")
public class StudentVocabularyController {

    @Autowired
    private StudentVocabularyService studentVocabularyService;

    // =====================================================
    // LƯU TỪ VỰNG
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<SavedVocabularyResponse>> saveVocabulary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody SaveVocabularyRequest request
    ) {

        SavedVocabularyResponse response =
                studentVocabularyService.saveVocabulary(
                        userDetails.getUser().getId(),
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lưu từ vựng thành công",
                        response
                )
        );
    }

    // =====================================================
    // LẤY DANH SÁCH TỪ VỰNG
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavedVocabularyResponse>>> getVocabularies(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) LearningStatus status
    ) {

        List<SavedVocabularyResponse> response;

        Long userId = userDetails.getUser().getId();

        if (status == null) {
            response = studentVocabularyService.getAll(userId);
        } else {
            response = studentVocabularyService.getByStatus(
                    userId,
                    status
            );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách từ vựng thành công",
                        response
                )
        );
    }

    // =====================================================
    // CẬP NHẬT TRẠNG THÁI HỌC
    // =====================================================

    @PatchMapping("/{studentVocabularyId}/status")
    public ResponseEntity<ApiResponse<SavedVocabularyResponse>> updateLearningStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long studentVocabularyId,
            @RequestBody UpdateLearningStatusRequest request
    ) {

        SavedVocabularyResponse response =
                studentVocabularyService.updateStatus(
                        userDetails.getUser().getId(),
                        studentVocabularyId,
                        request.getStatus()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Cập nhật trạng thái học thành công",
                        response
                )
        );
    }
}