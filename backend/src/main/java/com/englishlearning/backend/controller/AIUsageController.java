package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.AIUsage.AIUsageDashboardResponse;
import com.englishlearning.backend.dto.response.AIUsage.AIUsageDetailResponse;
import com.englishlearning.backend.dto.response.AIUsage.AIUsageStatsResponse;
import com.englishlearning.backend.dto.response.ApiResponse;

import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.AI.AIUsageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/ai-usage")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AIUsageController {

    private final AIUsageService aiUsageService;

    /**
     * GET /api/v1/admin/ai-usage/stats
     * Lấy thống kê AI Usage
     * Query params: startDate, endDate (optional, mặc định 30 ngày gần nhất)
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AIUsageStatsResponse>> getUsageStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} getting AI usage stats", userDetails.getUsername());

        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        AIUsageStatsResponse response = aiUsageService.getUsageStats(startDate, endDate);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy thống kê AI usage thành công", response)
        );
    }

    /**
     * GET /api/v1/admin/ai-usage/history
     * Lấy lịch sử AI Usage có phân trang
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<AIUsageDetailResponse>>> getUsageHistory(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} getting AI usage history", userDetails.getUsername());

        Page<AIUsageDetailResponse> response = aiUsageService.getUsageHistory(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy lịch sử AI usage thành công", response)
        );
    }

    /**
     * GET /api/v1/admin/ai-usage/dashboard
     * Dashboard thống kê AI Usage
     * Query params:
     *   - startDate, endDate (optional, mặc định 30 ngày gần nhất)
     *   - topLimit (optional, mặc định 5)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AIUsageDashboardResponse>> getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "5") int topLimit,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} getting AI usage dashboard", userDetails.getUsername());

        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        Pageable pageable = PageRequest.of(0, topLimit);
        AIUsageDashboardResponse response = aiUsageService.getDashboardStats(startDate, endDate, pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy dashboard AI usage thành công", response)
        );
    }
}