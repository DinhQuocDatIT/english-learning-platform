package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.dto.response.AIUsage.AIUsageDashboardResponse;
import com.englishlearning.backend.dto.response.AIUsage.AIUsageDetailResponse;
import com.englishlearning.backend.dto.response.AIUsage.AIUsageStatsResponse;

import com.englishlearning.backend.entity.AIUsage;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.repository.AIUsageRepository;
import com.englishlearning.backend.service.AI.AIUsageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AIUsageServiceImpl implements AIUsageService {

    private final AIUsageRepository aiUsageRepository;

    // ===== GET USAGE STATS (CŨ - GIỮ NGUYÊN) =====
    @Override
    public AIUsageStatsResponse getUsageStats(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting AI usage stats from {} to {}", startDate, endDate);

        try {
            Object[] overall = aiUsageRepository.getOverallStats(startDate, endDate);

            Long totalInputTokens = 0L;
            Long totalOutputTokens = 0L;
            Long totalTokens = 0L;
            Long totalRequests = 0L;
            Long successCount = 0L;
            Double totalCost = 0.0;
            Double avgResponseTime = 0.0;

            if (overall != null && overall.length >= 7) {
                totalInputTokens = overall[0] != null ? ((Number) overall[0]).longValue() : 0L;
                totalOutputTokens = overall[1] != null ? ((Number) overall[1]).longValue() : 0L;
                totalTokens = overall[2] != null ? ((Number) overall[2]).longValue() : 0L;
                totalRequests = overall[3] != null ? ((Number) overall[3]).longValue() : 0L;
                successCount = overall[4] != null ? ((Number) overall[4]).longValue() : 0L;
                totalCost = overall[5] != null ? ((Number) overall[5]).doubleValue() : 0.0;
                avgResponseTime = overall[6] != null ? ((Number) overall[6]).doubleValue() : 0.0;
            }

            Double successRate = totalRequests > 0 ?
                    (successCount.doubleValue() / totalRequests.doubleValue()) * 100 : 0.0;

            List<AIUsageStatsResponse.DailyUsageStats> dailyStats = new ArrayList<>();
            try {
                List<Object[]> dailyData = aiUsageRepository.dailyStats(startDate, endDate);
                for (Object[] row : dailyData) {
                    if (row != null && row.length >= 5) {
                        LocalDate date = row[0] != null ? ((java.sql.Date) row[0]).toLocalDate() : LocalDate.now();
                        Long requests = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                        Long tokens = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                        BigDecimal cost = row[3] != null ? BigDecimal.valueOf(((Number) row[3]).doubleValue()) : BigDecimal.ZERO;
                        Double avgTime = row[4] != null ? ((Number) row[4]).doubleValue() : 0.0;

                        dailyStats.add(AIUsageStatsResponse.DailyUsageStats.builder()
                                .date(date)
                                .requests(requests)
                                .tokens(tokens)
                                .cost(cost)
                                .avgResponseTime(avgTime)
                                .build());
                    }
                }
            } catch (Exception e) {
                log.warn("Error getting daily stats: {}", e.getMessage());
            }

            List<AIUsageStatsResponse.ModelUsageStats> modelStats = new ArrayList<>();
            try {
                List<Object[]> modelData = aiUsageRepository.statsByModel(startDate, endDate);
                for (Object[] row : modelData) {
                    if (row != null && row.length >= 4) {
                        modelStats.add(AIUsageStatsResponse.ModelUsageStats.builder()
                                .model(row[0] != null ? row[0].toString() : "Unknown")
                                .requests(((Number) row[1]).longValue())
                                .tokens(((Number) row[2]).longValue())
                                .cost(BigDecimal.valueOf(((Number) row[3]).doubleValue()))
                                .build());
                    }
                }
            } catch (Exception e) {
                log.warn("Error getting model stats: {}", e.getMessage());
            }

            List<AIUsageStatsResponse.ProviderUsageStats> providerStats = new ArrayList<>();
            try {
                List<Object[]> providerData = aiUsageRepository.statsByProvider(startDate, endDate);
                for (Object[] row : providerData) {
                    if (row != null && row.length >= 4) {
                        providerStats.add(AIUsageStatsResponse.ProviderUsageStats.builder()
                                .provider(row[0] != null ? row[0].toString() : "Unknown")
                                .requests(((Number) row[1]).longValue())
                                .tokens(((Number) row[2]).longValue())
                                .cost(BigDecimal.valueOf(((Number) row[3]).doubleValue()))
                                .build());
                    }
                }
            } catch (Exception e) {
                log.warn("Error getting provider stats: {}", e.getMessage());
            }

            List<AIUsageStatsResponse.RequestTypeUsageStats> requestTypeStats = new ArrayList<>();
            try {
                List<Object[]> requestTypeData = aiUsageRepository.statsByRequestType(startDate, endDate);
                for (Object[] row : requestTypeData) {
                    if (row != null && row.length >= 4) {
                        String requestType = row[0] != null ? row[0].toString() : "UNKNOWN";
                        requestTypeStats.add(AIUsageStatsResponse.RequestTypeUsageStats.builder()
                                .requestType(requestType)
                                .count(((Number) row[1]).longValue())
                                .tokens(((Number) row[2]).longValue())
                                .cost(BigDecimal.valueOf(((Number) row[3]).doubleValue()))
                                .build());
                    }
                }
            } catch (Exception e) {
                log.warn("Error getting request type stats: {}", e.getMessage());
            }

            return AIUsageStatsResponse.builder()
                    .totalRequests(totalRequests)
                    .totalTokens(totalTokens)
                    .totalInputTokens(totalInputTokens)
                    .totalOutputTokens(totalOutputTokens)
                    .totalCost(BigDecimal.valueOf(totalCost).setScale(6, RoundingMode.HALF_UP))
                    .avgResponseTimeMs(Math.round(avgResponseTime * 100.0) / 100.0)
                    .successRate(Math.round(successRate * 100.0) / 100.0)
                    .dailyStats(dailyStats)
                    .modelStats(modelStats)
                    .providerStats(providerStats)
                    .requestTypeStats(requestTypeStats)
                    .build();

        } catch (Exception e) {
            log.error("Error getting usage stats: {}", e.getMessage(), e);
            return AIUsageStatsResponse.builder()
                    .totalRequests(0L)
                    .totalTokens(0L)
                    .totalInputTokens(0L)
                    .totalOutputTokens(0L)
                    .totalCost(BigDecimal.ZERO)
                    .avgResponseTimeMs(0.0)
                    .successRate(0.0)
                    .dailyStats(new ArrayList<>())
                    .modelStats(new ArrayList<>())
                    .providerStats(new ArrayList<>())
                    .requestTypeStats(new ArrayList<>())
                    .build();
        }
    }

    // ===== GET USAGE HISTORY =====
    @Override
    public Page<AIUsageDetailResponse> getUsageHistory(Pageable pageable) {
        Page<AIUsage> usagePage = aiUsageRepository.findAllOrderByCreatedAtDesc(pageable);
        return usagePage.map(this::convertToDetailResponse);
    }

    @Override
    public Page<AIUsageDetailResponse> getUsageHistoryByStudent(Long studentId, Pageable pageable) {
        Page<AIUsage> usagePage = aiUsageRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable);
        return usagePage.map(this::convertToDetailResponse);
    }

    // ===== GET DASHBOARD STATS =====
    @Override
    public AIUsageDashboardResponse getDashboardStats(LocalDateTime startDate, LocalDateTime endDate,
                                                      Pageable pageable) {
        log.info("Getting dashboard stats from {} to {}", startDate, endDate);

        try {
            // ===== 1. TỔNG QUAN =====
            Object[] overviewData = aiUsageRepository.getOverviewStats(startDate, endDate);

            Long totalRequests = 0L;
            Long totalTokens = 0L;
            BigDecimal totalCost = BigDecimal.ZERO;
            Double avgResponseTime = 0.0;

            if (overviewData != null && overviewData.length >= 4) {
                totalRequests = overviewData[0] != null ? ((Number) overviewData[0]).longValue() : 0L;
                totalTokens = overviewData[1] != null ? ((Number) overviewData[1]).longValue() : 0L;
                totalCost = overviewData[2] != null ? BigDecimal.valueOf(((Number) overviewData[2]).doubleValue()) : BigDecimal.ZERO;
                avgResponseTime = overviewData[3] != null ? ((Number) overviewData[3]).doubleValue() : 0.0;
            }

            log.info("📊 Overview - Requests: {}, Tokens: {}, Cost: {}, AvgResponse: {}ms",
                    totalRequests, totalTokens, totalCost, avgResponseTime);

            BigDecimal avgCostPerRequest = totalRequests > 0 ?
                    totalCost.divide(BigDecimal.valueOf(totalRequests), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

            AIUsageDashboardResponse.Overview overview = AIUsageDashboardResponse.Overview.builder()
                    .totalRequests(totalRequests)
                    .totalTokens(totalTokens)
                    .totalCost(totalCost)
                    .avgCostPerRequest(avgCostPerRequest)
                    .avgResponseTimeMs(avgResponseTime)
                    .build();

            // ===== 2. BIỂU ĐỒ THEO NGÀY =====
            List<Object[]> dailyData = aiUsageRepository.getDailyChartData(startDate, endDate);
            List<AIUsageDashboardResponse.DailyChartData> dailyChart = new ArrayList<>();

            if (dailyData != null) {
                for (Object[] row : dailyData) {
                    if (row != null && row.length >= 4) {
                        LocalDate date = LocalDate.now();
                        try {
                            Object dateObj = row[0];
                            if (dateObj instanceof java.sql.Date) {
                                date = ((java.sql.Date) dateObj).toLocalDate();
                            } else if (dateObj instanceof LocalDate) {
                                date = (LocalDate) dateObj;
                            } else if (dateObj != null) {
                                date = LocalDate.parse(dateObj.toString());
                            }
                        } catch (Exception e) {
                            log.warn("Error parsing date: {}", e.getMessage());
                        }

                        dailyChart.add(AIUsageDashboardResponse.DailyChartData.builder()
                                .date(date)
                                .requests(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                                .tokens(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                                .cost(row[3] != null ? BigDecimal.valueOf(((Number) row[3]).doubleValue()) : BigDecimal.ZERO)
                                .build());
                    }
                }
            }

            // ===== 3. THỐNG KÊ THEO MODEL =====
            List<Object[]> modelData = aiUsageRepository.statsByModel(startDate, endDate);
            List<AIUsageDashboardResponse.ModelStats> modelStats = new ArrayList<>();
            BigDecimal totalModelCost = BigDecimal.ZERO;

            if (modelData != null) {
                for (Object[] row : modelData) {
                    if (row != null && row.length >= 4) {
                        BigDecimal cost = row[3] != null ? BigDecimal.valueOf(((Number) row[3]).doubleValue()) : BigDecimal.ZERO;
                        totalModelCost = totalModelCost.add(cost);
                    }
                }

                for (Object[] row : modelData) {
                    if (row != null && row.length >= 4) {
                        BigDecimal cost = row[3] != null ? BigDecimal.valueOf(((Number) row[3]).doubleValue()) : BigDecimal.ZERO;
                        Double percentage = totalModelCost.compareTo(BigDecimal.ZERO) > 0 ?
                                cost.divide(totalModelCost, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

                        modelStats.add(AIUsageDashboardResponse.ModelStats.builder()
                                .model(row[0] != null ? row[0].toString() : "Unknown")
                                .requests(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                                .tokens(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                                .cost(cost)
                                .percentage(Math.round(percentage * 10.0) / 10.0)
                                .build());
                    }
                }
            }

            // ===== 4. BÁO CÁO THEO THÁNG =====
            List<Object[]> monthlyData = aiUsageRepository.getMonthlyReport(startDate, endDate);
            List<AIUsageDashboardResponse.MonthlyReport> monthlyReport = new ArrayList<>();
            BigDecimal prevCost = null;

            if (monthlyData != null) {
                for (Object[] row : monthlyData) {
                    if (row != null && row.length >= 4) {
                        BigDecimal cost = row[3] != null ? BigDecimal.valueOf(((Number) row[3]).doubleValue()) : BigDecimal.ZERO;
                        Double growthRate = null;

                        if (prevCost != null && prevCost.compareTo(BigDecimal.ZERO) > 0) {
                            growthRate = cost.subtract(prevCost)
                                    .divide(prevCost, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .doubleValue();
                            growthRate = Math.round(growthRate * 10.0) / 10.0;
                        }

                        monthlyReport.add(AIUsageDashboardResponse.MonthlyReport.builder()
                                .month(row[0] != null ? row[0].toString() : "Unknown")
                                .requests(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                                .tokens(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                                .cost(cost)
                                .growthRate(growthRate)
                                .build());

                        prevCost = cost;
                    }
                }
            }

            // ===== 5. TOP HỌC VIÊN =====
            List<Object[]> topStudentData = aiUsageRepository.getTopStudents(startDate, endDate, pageable);
            List<AIUsageDashboardResponse.TopStudent> topStudents = new ArrayList<>();
            BigDecimal totalStudentCost = BigDecimal.ZERO;

            if (topStudentData != null) {
                for (Object[] row : topStudentData) {
                    if (row != null && row.length >= 5) {
                        BigDecimal cost = row[4] != null ? BigDecimal.valueOf(((Number) row[4]).doubleValue()) : BigDecimal.ZERO;
                        totalStudentCost = totalStudentCost.add(cost);
                    }
                }

                for (Object[] row : topStudentData) {
                    if (row != null && row.length >= 5) {
                        BigDecimal cost = row[4] != null ? BigDecimal.valueOf(((Number) row[4]).doubleValue()) : BigDecimal.ZERO;
                        Double percentage = totalStudentCost.compareTo(BigDecimal.ZERO) > 0 ?
                                cost.divide(totalStudentCost, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

                        String studentName = row[1] != null ? row[1].toString() : "Unknown";

                        topStudents.add(AIUsageDashboardResponse.TopStudent.builder()
                                .studentId(row[0] != null ? ((Number) row[0]).longValue() : 0L)
                                .studentName(studentName)
                                .requests(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                                .tokens(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                                .cost(cost)
                                .percentage(Math.round(percentage * 10.0) / 10.0)
                                .build());
                    }
                }
            }

            // ===== 6. THỐNG KÊ THÀNH CÔNG/THẤT BẠI =====
            Object[] successData = aiUsageRepository.getSuccessStats(startDate, endDate);
            Long successCount = 0L;
            Long failedCount = 0L;
            Double successRate = 0.0;

            if (successData != null && successData.length >= 3) {
                Long total = successData[0] != null ? ((Number) successData[0]).longValue() : 0L;
                successCount = successData[1] != null ? ((Number) successData[1]).longValue() : 0L;
                failedCount = successData[2] != null ? ((Number) successData[2]).longValue() : 0L;

                if (total > 0) {
                    successRate = (successCount.doubleValue() / total.doubleValue()) * 100;
                    successRate = Math.round(successRate * 100.0) / 100.0;
                }
            }

            log.info("📊 Success/Failed - Success: {}, Failed: {}, Rate: {}%",
                    successCount, failedCount, successRate);

            return AIUsageDashboardResponse.builder()
                    .overview(overview)
                    .dailyChart(dailyChart)
                    .modelStats(modelStats)
                    .monthlyReport(monthlyReport)
                    .topStudents(topStudents)
                    .successCount(successCount)
                    .failedCount(failedCount)
                    .successRate(successRate)
                    .build();

        } catch (Exception e) {
            log.error("Error getting dashboard stats: {}", e.getMessage(), e);
            return AIUsageDashboardResponse.builder()
                    .overview(AIUsageDashboardResponse.Overview.builder()
                            .totalRequests(0L)
                            .totalTokens(0L)
                            .totalCost(BigDecimal.ZERO)
                            .avgCostPerRequest(BigDecimal.ZERO)
                            .avgResponseTimeMs(0.0)
                            .build())
                    .dailyChart(new ArrayList<>())
                    .modelStats(new ArrayList<>())
                    .monthlyReport(new ArrayList<>())
                    .topStudents(new ArrayList<>())
                    .successCount(0L)
                    .failedCount(0L)
                    .successRate(0.0)
                    .build();
        }
    }

    // ===== PRIVATE METHODS =====
    private AIUsageDetailResponse convertToDetailResponse(AIUsage usage) {
        String studentName = "";
        String studentEmail = "";
        if (usage.getStudent() != null) {
            Student student = usage.getStudent();
            if (student.getUser() != null) {
                studentName = student.getUser().getFullName() != null ?
                        student.getUser().getFullName() : "";
                studentEmail = student.getUser().getEmail() != null ?
                        student.getUser().getEmail() : "";
            }
        }

        return AIUsageDetailResponse.builder()
                .id(usage.getId())
                .studentName(studentName)
                .studentEmail(studentEmail)
                .requestType(usage.getRequestType() != null ? usage.getRequestType().name() : "")
                .provider(usage.getProvider() != null ? usage.getProvider() : "")
                .model(usage.getModel() != null ? usage.getModel() : "")
                .inputTokens(usage.getInputTokens() != null ? usage.getInputTokens() : 0)
                .outputTokens(usage.getOutputTokens() != null ? usage.getOutputTokens() : 0)
                .totalTokens(usage.getTotalTokens() != null ? usage.getTotalTokens() : 0)
                .estimatedCost(usage.getEstimatedCost() != null ? usage.getEstimatedCost() : BigDecimal.ZERO)
                .inputPricePerMillion(usage.getInputPricePerMillion())
                .outputPricePerMillion(usage.getOutputPricePerMillion())
                .responseTimeMs(usage.getResponseTimeMs() != null ? usage.getResponseTimeMs() : 0)
                .success(usage.getSuccess() != null ? usage.getSuccess() : false)
                .errorMessage(usage.getErrorMessage())
                .createdAt(usage.getCreatedAt())
                .build();
    }
}