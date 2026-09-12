package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.RevenueTrendResponse;
import com.englishlearning.backend.service.AdminStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/statistics")
@RequiredArgsConstructor
public class AdminStatisticsController {

    private final AdminStatisticsService adminStatisticsService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/revenue-trend")
    public ResponseEntity<ApiResponse<RevenueTrendResponse>> getRevenueTrend(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @RequestParam(required = false, defaultValue = "month")
            String groupBy
    ) {
        RevenueTrendResponse response =
                adminStatisticsService.getRevenueTrend(fromDate, toDate, groupBy);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy xu hướng doanh thu thành công",
                        response
                )
        );
    }
}