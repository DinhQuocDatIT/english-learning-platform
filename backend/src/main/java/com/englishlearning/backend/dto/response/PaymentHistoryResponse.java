package com.englishlearning.backend.dto.response;

import com.englishlearning.backend.enums.StudentMembershipStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentHistoryResponse {
    private Long id;
    private BigDecimal paidPrice;
    private StudentMembershipStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime paidAt;
    private long durationDays;
    private long remainingDays;

    // Package info
    private Long packageId;
    private String packageName;
    private String packageDescription;

    // Student info
    private Long studentId;
    private Long userId;
    private String userName;
    private String userEmail;
}