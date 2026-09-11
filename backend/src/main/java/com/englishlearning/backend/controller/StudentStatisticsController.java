package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.StudentStatisticsResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.StudentStatisticsService;
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
@RequestMapping("/api/v1/student-statistics")
@RequiredArgsConstructor
public class StudentStatisticsController {

    private final StudentStatisticsService studentStatisticsService;

    /**
     * GET /api/v1/student-statistics/me
     * Lấy toàn bộ thống kê của student đang đăng nhập
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentStatisticsResponse>> getMyStatistics(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting statistics for user: {}", userId);

        StudentStatisticsResponse response = studentStatisticsService.getStatistics(userId);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Lấy thống kê thành công",
                response
        ));
    }

    /**
     * GET /api/v1/student-statistics/me/quick
     * Lấy thống kê rút gọn
     */
    @GetMapping("/me/quick")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentStatisticsResponse>> getMyQuickStats(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting quick statistics for user: {}", userId);

        StudentStatisticsResponse response = studentStatisticsService.getQuickStats(userId);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Lấy thống kê nhanh thành công",
                response
        ));
    }
}