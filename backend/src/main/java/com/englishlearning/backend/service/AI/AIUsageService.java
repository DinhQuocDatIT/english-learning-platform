package com.englishlearning.backend.service.AI;


import com.englishlearning.backend.dto.response.AIUsage.AIUsageDashboardResponse;
import com.englishlearning.backend.dto.response.AIUsage.AIUsageDetailResponse;
import com.englishlearning.backend.dto.response.AIUsage.AIUsageStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface AIUsageService {

    AIUsageStatsResponse getUsageStats(LocalDateTime startDate, LocalDateTime endDate);

    Page<AIUsageDetailResponse> getUsageHistory(Pageable pageable);

    Page<AIUsageDetailResponse> getUsageHistoryByStudent(Long studentId, Pageable pageable);
    AIUsageDashboardResponse getDashboardStats(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
