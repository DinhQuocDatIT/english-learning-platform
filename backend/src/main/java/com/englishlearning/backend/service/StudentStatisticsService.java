package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.response.StudentStatisticsResponse;

public interface StudentStatisticsService {
    /**
     * Lấy toàn bộ thống kê của student theo userId
     */
    StudentStatisticsResponse getStatistics(Long userId);

    /**
     * Lấy thống kê rút gọn (chỉ overview + level + ranking)
     */
    StudentStatisticsResponse getQuickStats(Long userId);
}