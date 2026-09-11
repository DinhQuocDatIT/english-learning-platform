package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.StudentProfileResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/student-profile")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    /**
     * GET /api/v1/student-profile/me
     * Lấy toàn bộ thông tin profile của student đang đăng nhập
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting profile for user: {}", userId);

        StudentProfileResponse response = studentProfileService.getMyProfile(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy thông tin profile thành công",
                        response
                )
        );
    }
}