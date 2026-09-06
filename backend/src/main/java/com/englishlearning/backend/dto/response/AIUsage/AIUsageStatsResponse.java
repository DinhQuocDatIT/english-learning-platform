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
public class AIUsageStatsResponse {

    // Tổng quan
    private Long totalRequests;
    private Long totalTokens;
    private Long totalInputTokens;
    private Long totalOutputTokens;
    private BigDecimal totalCost;
    private Double avgResponseTimeMs;
    private Double successRate;

    // ✅ Thêm field giá trung bình
    private Double avgInputPricePerMillion;
    private Double avgOutputPricePerMillion;

    // Theo ngày
    private List<DailyUsageStats> dailyStats;

    // Theo model
    private List<ModelUsageStats> modelStats;

    // Theo provider
    private List<ProviderUsageStats> providerStats;

    // Theo request type
    private List<RequestTypeUsageStats> requestTypeStats;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyUsageStats {
        private LocalDate date;
        private Long requests;
        private Long tokens;
        private BigDecimal cost;
        private Double avgResponseTime;
        private Double avgInputPrice;
        private Double avgOutputPrice;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelUsageStats {
        private String model;
        private Long requests;
        private Long tokens;
        private BigDecimal cost;
        private Double avgInputPrice;
        private Double avgOutputPrice;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderUsageStats {
        private String provider;
        private Long requests;
        private Long tokens;
        private BigDecimal cost;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequestTypeUsageStats {
        private String requestType;
        private Long count;
        private Long tokens;
        private BigDecimal cost;
    }
}