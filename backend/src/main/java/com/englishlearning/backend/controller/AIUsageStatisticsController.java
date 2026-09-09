package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.AIUsage.*;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.service.AIUsageStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admins/ai-usage/statistics")
public class AIUsageStatisticsController {

    @Autowired
    private AIUsageStatisticsService statisticsService;


    // =========================================================
    // OVERVIEW
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AIUsageOverviewResponse>> getOverview(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        AIUsageOverviewResponse response =
                statisticsService.getOverview(from, to);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy tổng quan thống kê AI thành công",
                        response
                )
        );
    }


    // =========================================================
    // TIMELINE
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/timeline")
    public ResponseEntity<ApiResponse<List<AIUsageTimelineResponse>>> getTimeline(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        List<AIUsageTimelineResponse> response =
                statisticsService.getTimeline(from, to);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy thống kê AI theo thời gian thành công",
                        response
                )
        );
    }


    // =========================================================
    // BY REQUEST TYPE
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/by-request-type")
    public ResponseEntity<ApiResponse<List<AIUsageRequestTypeResponse>>>
    getByRequestType(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        List<AIUsageRequestTypeResponse> response =
                statisticsService.getByRequestType(from, to);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy thống kê AI theo loại yêu cầu thành công",
                        response
                )
        );
    }


    // =========================================================
    // BY MODEL
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/by-model")
    public ResponseEntity<ApiResponse<List<AIUsageModelResponse>>>
    getByModel(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        List<AIUsageModelResponse> response =
                statisticsService.getByModel(from, to);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy thống kê AI theo model thành công",
                        response
                )
        );
    }


    // =========================================================
    // COST
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/cost")
    public ResponseEntity<ApiResponse<AIUsageCostResponse>> getCost(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        AIUsageCostResponse response =
                statisticsService.getCost(from, to);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy thống kê chi phí AI thành công",
                        response
                )
        );
    }


    // =========================================================
    // PERFORMANCE
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/performance")
    public ResponseEntity<ApiResponse<AIUsagePerformanceResponse>>
    getPerformance(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        AIUsagePerformanceResponse response =
                statisticsService.getPerformance(from, to);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy thống kê hiệu năng AI thành công",
                        response
                )
        );
    }


    // =========================================================
    // TOP STUDENTS
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/top-students")
    public ResponseEntity<ApiResponse<List<AIUsageTopStudentResponse>>>
    getTopStudents(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            @RequestParam(defaultValue = "10")
            int limit

    ) {

        List<AIUsageTopStudentResponse> response =
                statisticsService.getTopStudents(
                        from,
                        to,
                        Math.min(limit, 100)
                );

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách học viên sử dụng AI nhiều nhất thành công",
                        response
                )
        );
    }
}


