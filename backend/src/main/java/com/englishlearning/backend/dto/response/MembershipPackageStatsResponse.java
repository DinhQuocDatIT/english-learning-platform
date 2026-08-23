package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class MembershipPackageStatsResponse {
    private Long totalUsers;
    private Long totalPackages;
    private BigDecimal totalRevenue;
}