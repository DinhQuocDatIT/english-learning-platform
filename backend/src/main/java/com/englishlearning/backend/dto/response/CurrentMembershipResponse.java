package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class CurrentMembershipResponse {
    private Long id;
    private Long packageId;
    private String packageName;
    private BigDecimal paidPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private long remainingDays;
}