package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.PaymentHistoryResponse;
import com.englishlearning.backend.dto.response.PaymentSummaryResponse;
import com.englishlearning.backend.entity.StudentMembership;
import com.englishlearning.backend.enums.StudentMembershipStatus;
import com.englishlearning.backend.repository.StudentMembershipRepository;
import com.englishlearning.backend.service.PaymentHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

@Service
@Transactional(readOnly = true)
public class PaymentHistoryServiceImpl implements PaymentHistoryService {

    private final StudentMembershipRepository studentMembershipRepository;

    public PaymentHistoryServiceImpl(
            StudentMembershipRepository studentMembershipRepository
    ) {
        this.studentMembershipRepository = studentMembershipRepository;
    }

    @Override
    public Page<PaymentHistoryResponse> getAllPaymentHistory(
            StudentMembershipStatus status,
            String keyword,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    ) {
        // Convert LocalDate → LocalDateTime
        LocalDateTime fromDateTime = fromDate != null
                ? fromDate.atStartOfDay()
                : null;

        LocalDateTime toDateTime = toDate != null
                ? toDate.atTime(LocalTime.MAX)
                : null;

        Page<StudentMembership> page = studentMembershipRepository.search(
                status,
                keyword,
                fromDateTime,
                toDateTime,
                pageable
        );

        return page.map(this::toResponse);
    }

    @Override
    public PaymentSummaryResponse getAdminPaymentSummary() {
        return PaymentSummaryResponse.builder()
                .totalSpent(studentMembershipRepository.sumTotalRevenue())
                .totalOrders(studentMembershipRepository.count())
                .activeOrders(studentMembershipRepository.countByStatus(
                        StudentMembershipStatus.ACTIVE))
                .expiredOrders(studentMembershipRepository.countByStatus(
                        StudentMembershipStatus.EXPIRED))
                .build();
    }

    private PaymentHistoryResponse toResponse(StudentMembership membership) {
        LocalDate today = LocalDate.now();

        long durationDays = ChronoUnit.DAYS.between(
                membership.getStartDate(),
                membership.getEndDate()
        );

        long remainingDays = 0;
        if (membership.getStatus() == StudentMembershipStatus.ACTIVE
                && !membership.getEndDate().isBefore(today)) {
            remainingDays = ChronoUnit.DAYS.between(
                    today,
                    membership.getEndDate()
            );
        }

        var pkg = membership.getMembershipPackage();
        var student = membership.getStudent();
        var user = student != null ? student.getUser() : null;

        return PaymentHistoryResponse.builder()
                .id(membership.getId())
                .paidPrice(membership.getPaidPrice())
                .status(membership.getStatus())
                .startDate(membership.getStartDate())
                .endDate(membership.getEndDate())
                .paidAt(membership.getCreatedAt())
                .durationDays(durationDays)
                .remainingDays(remainingDays)
                .packageId(pkg.getId())
                .packageName(pkg.getName())
                .studentId(student != null ? student.getId() : null)
                .userId(user != null ? user.getId() : null)
                .userName(user != null ? user.getFullName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .build();
    }
}