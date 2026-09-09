package com.englishlearning.backend.dto.response.AIUsage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIUsageOverviewResponse {

    private Long totalRequests;
    private Long successfulRequests;
    private Long failedRequests;

    private Double successRate;

    private Long totalInputTokens;
    private Long totalOutputTokens;
    private Long totalTokens;

    private BigDecimal totalEstimatedCost;

    private Double averageResponseTimeMs;
    private Integer fastestResponseTimeMs;
    private Integer slowestResponseTimeMs;

    private Long activeStudents;
}