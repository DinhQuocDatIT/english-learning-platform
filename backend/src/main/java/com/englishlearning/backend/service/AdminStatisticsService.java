package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.response.RevenueTrendResponse;

import java.time.LocalDate;

public interface AdminStatisticsService {

    RevenueTrendResponse getRevenueTrend(
            LocalDate fromDate,
            LocalDate toDate,
            String groupBy
    );
}