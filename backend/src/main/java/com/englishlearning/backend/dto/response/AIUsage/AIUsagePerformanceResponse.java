package com.englishlearning.backend.dto.response.AIUsage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIUsagePerformanceResponse {

    private Double successRate;
    private Double errorRate;

    private Double averageResponseTimeMs;

    private Integer fastestResponseTimeMs;
    private Integer slowestResponseTimeMs;

    private Long totalErrors;
}