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
public class AIUsageModelResponse {

    private String provider;
    private String model;

    private Long requests;
    private Long successfulRequests;
    private Long failedRequests;

    private Double successRate;

    private Long inputTokens;
    private Long outputTokens;
    private Long totalTokens;

    private BigDecimal estimatedCost;

    private Double averageResponseTimeMs;
}