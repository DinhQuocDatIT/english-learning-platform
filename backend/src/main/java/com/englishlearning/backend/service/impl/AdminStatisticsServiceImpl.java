package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.RevenueTrendResponse;
import com.englishlearning.backend.repository.StudentMembershipRepository;
import com.englishlearning.backend.service.AdminStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatisticsServiceImpl implements AdminStatisticsService {

    private final StudentMembershipRepository studentMembershipRepository;

    @Override
    public RevenueTrendResponse getRevenueTrend(
            LocalDate fromDate,
            LocalDate toDate,
            String groupBy
    ) {
        // Default: 6 tháng gần nhất nếu không truyền
        if (toDate == null) {
            toDate = LocalDate.now();
        }
        if (fromDate == null) {
            fromDate = toDate.minusMonths(5).withDayOfMonth(1);
        }

        // Validate
        if (fromDate.isAfter(toDate)) {
            throw new RuntimeException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        // Default groupBy = month
        if (groupBy == null || groupBy.isBlank()) {
            groupBy = "month";
        }

        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.atTime(LocalTime.MAX);

        // Query raw data
        List<Object[]> rows = studentMembershipRepository
                .sumRevenueGroupByMonth(fromDateTime, toDateTime);

        // Map raw → DTO points
        List<RevenueTrendResponse.RevenuePoint> points = new ArrayList<>();

        for (Object[] row : rows) {
            String period = (String) row[0];              // "2026-03"
            BigDecimal revenue = (BigDecimal) row[1];
            Long transactions = ((Number) row[2]).longValue();

            YearMonth ym = YearMonth.parse(period);
            String label = "Tháng " + ym.getMonthValue();

            points.add(
                    RevenueTrendResponse.RevenuePoint.builder()
                            .label(label)
                            .period(period)
                            .revenue(revenue)
                            .transactions(transactions)
                            .build()
            );
        }

        // Tính tổng
        BigDecimal totalRevenue = points.stream()
                .map(RevenueTrendResponse.RevenuePoint::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long totalTransactions = points.stream()
                .mapToLong(RevenueTrendResponse.RevenuePoint::getTransactions)
                .sum();

        return RevenueTrendResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .groupBy(groupBy)
                .totalRevenue(totalRevenue)
                .totalTransactions(totalTransactions)
                .points(points)
                .build();
    }
}