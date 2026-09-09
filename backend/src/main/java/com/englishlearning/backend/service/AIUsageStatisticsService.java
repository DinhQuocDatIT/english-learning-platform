package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.response.AIUsage.*;

import java.time.LocalDate;
import java.util.List;

public interface AIUsageStatisticsService {

    AIUsageOverviewResponse getOverview(
            LocalDate from,
            LocalDate to
    );

    List<AIUsageTimelineResponse> getTimeline(
            LocalDate from,
            LocalDate to
    );

    List<AIUsageRequestTypeResponse> getByRequestType(
            LocalDate from,
            LocalDate to
    );

    List<AIUsageModelResponse> getByModel(
            LocalDate from,
            LocalDate to
    );

    AIUsageCostResponse getCost(
            LocalDate from,
            LocalDate to
    );

    AIUsagePerformanceResponse getPerformance(
            LocalDate from,
            LocalDate to
    );

    List<AIUsageTopStudentResponse> getTopStudents(
            LocalDate from,
            LocalDate to,
            int limit
    );
}