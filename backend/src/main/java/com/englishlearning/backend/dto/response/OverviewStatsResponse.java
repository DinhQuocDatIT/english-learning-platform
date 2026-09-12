package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class OverviewStatsResponse {

    private Long totalStudents;
    private Long totalTeachers;
    private Long vipSold;
    private BigDecimal totalRevenue;
    private Long totalAIRequests;
}