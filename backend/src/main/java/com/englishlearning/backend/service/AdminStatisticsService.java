package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.response.OverviewStatsResponse;
import com.englishlearning.backend.dto.response.RevenueTrendResponse;
import com.englishlearning.backend.dto.response.StudyActivitiesResponse;

import java.time.LocalDate;

public interface AdminStatisticsService {

    RevenueTrendResponse getRevenueTrend(
            LocalDate fromDate,
            LocalDate toDate,
            String groupBy
    );
    StudyActivitiesResponse getStudyActivities();
    OverviewStatsResponse getOverview();
}