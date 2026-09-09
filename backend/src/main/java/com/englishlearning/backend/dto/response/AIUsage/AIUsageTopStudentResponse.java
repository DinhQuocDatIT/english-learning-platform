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
public class AIUsageTopStudentResponse {

    private Long studentId;
    private String studentName;

    private Long requests;
    private Long totalTokens;

    private BigDecimal estimatedCost;
}