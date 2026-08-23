package com.englishlearning.backend.dto.response;

import com.englishlearning.backend.enums.StudentMembershipStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class StudentMembershipResponse {
    private Long id;
    private Long packageId;
    private String packageName;
    private BigDecimal paidPrice;
    private StudentMembershipStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private long remainingDays;
}