package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.response.PaymentHistoryResponse;
import com.englishlearning.backend.dto.response.PaymentSummaryResponse;
import com.englishlearning.backend.enums.StudentMembershipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PaymentHistoryService {

    Page<PaymentHistoryResponse> getAllPaymentHistory(
            StudentMembershipStatus status,
            String keyword,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    PaymentSummaryResponse getAdminPaymentSummary();
}