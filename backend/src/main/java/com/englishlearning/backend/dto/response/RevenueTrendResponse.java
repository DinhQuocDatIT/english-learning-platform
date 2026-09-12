package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class RevenueTrendResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private String groupBy;

    private BigDecimal totalRevenue;
    private Long totalTransactions;

    private List<RevenuePoint> points;

    @Getter
    @Builder
    public static class RevenuePoint {
        private String label;
        private String period;
        private BigDecimal revenue;
        private Long transactions;
    }
}