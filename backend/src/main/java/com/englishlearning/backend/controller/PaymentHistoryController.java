package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.PaymentHistoryResponse;
import com.englishlearning.backend.dto.response.PaymentSummaryResponse;
import com.englishlearning.backend.enums.StudentMembershipStatus;
import com.englishlearning.backend.service.PaymentHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentHistoryController {

    private final PaymentHistoryService paymentHistoryService;

    public PaymentHistoryController(PaymentHistoryService paymentHistoryService) {
        this.paymentHistoryService = paymentHistoryService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<PaymentHistoryResponse>>> getPaymentHistory(
            @RequestParam(required = false) StudentMembershipStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PaymentHistoryResponse> result =
                paymentHistoryService.getAllPaymentHistory(
                        status,
                        keyword,
                        fromDate,
                        toDate,      
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy lịch sử thanh toán thành công", result)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PaymentSummaryResponse>> getPaymentSummary() {
        PaymentSummaryResponse result =
                paymentHistoryService.getAdminPaymentSummary();

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy tổng quan thanh toán thành công", result)
        );
    }
}