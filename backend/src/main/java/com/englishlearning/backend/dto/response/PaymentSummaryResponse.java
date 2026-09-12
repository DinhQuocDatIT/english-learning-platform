package com.englishlearning.backend.dto.response;


import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PaymentSummaryResponse {
    private BigDecimal totalSpent;
    private long totalOrders;
    private long activeOrders;
    private long expiredOrders;
}