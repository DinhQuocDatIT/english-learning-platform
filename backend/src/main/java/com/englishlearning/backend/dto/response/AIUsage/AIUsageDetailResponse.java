package com.englishlearning.backend.dto.response.AIUsage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIUsageDetailResponse {
    private Long id;
    private String studentName;
    private String studentEmail;
    private String requestType;
    private String provider;
    private String model;
    private Integer inputTokens;
    private Integer outputTokens;
    private Integer totalTokens;
    private BigDecimal estimatedCost;
    private Integer responseTimeMs;
    private Boolean success;
    private String errorMessage;
    private LocalDateTime createdAt;
    private Double inputPricePerMillion;
    private Double outputPricePerMillion;
}