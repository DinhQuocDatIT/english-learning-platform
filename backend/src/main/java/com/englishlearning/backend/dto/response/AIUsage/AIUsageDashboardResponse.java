package com.englishlearning.backend.dto.response.AIUsage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIUsageDashboardResponse {

    // Tổng quan
    private Overview overview;

    // Biểu đồ theo ngày
    private List<DailyChartData> dailyChart;

    // Thống kê theo model
    private List<ModelStats> modelStats;

    // Báo cáo theo tháng
    private List<MonthlyReport> monthlyReport;

    // Top học viên
    private List<TopStudent> topStudents;

    // ✅ Thêm thống kê thành công/thất bại
    private Long successCount;
    private Long failedCount;
    private Double successRate;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Overview {
        private Long totalRequests;
        private Long totalTokens;
        private BigDecimal totalCost;
        private BigDecimal avgCostPerRequest;
        private Double avgResponseTimeMs;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyChartData {
        private LocalDate date;
        private Long requests;
        private Long tokens;
        private BigDecimal cost;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelStats {
        private String model;
        private Long requests;
        private Long tokens;
        private BigDecimal cost;
        private Double percentage;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyReport {
        private String month;
        private Long requests;
        private Long tokens;
        private BigDecimal cost;
        private Double growthRate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopStudent {
        private Long studentId;
        private String studentName;
        private Long requests;
        private Long tokens;
        private BigDecimal cost;
        private Double percentage;
    }
}