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
public class AIUsageCostResponse {

    private BigDecimal totalCost;

    private BigDecimal averageCostPerRequest;

    private BigDecimal inputCost;
    private BigDecimal outputCost;

    private Long totalInputTokens;
    private Long totalOutputTokens;
    private Long totalTokens;
}