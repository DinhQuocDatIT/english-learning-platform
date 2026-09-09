package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.dto.response.AIUsage.*;
import com.englishlearning.backend.enums.RequestType;
import com.englishlearning.backend.repository.AIUsageRepository;
import com.englishlearning.backend.service.AIUsageStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AIUsageStatisticsServiceImpl implements AIUsageStatisticsService {

    private final AIUsageRepository aiUsageRepository;

    @Override
    @Cacheable(value = "aiStats", key = "#from + '-' + #to", unless = "#result == null")
    public AIUsageOverviewResponse getOverview(LocalDate from, LocalDate to) {
        log.info("Getting overview statistics from {} to {}", from, to);
        long startTime = System.currentTimeMillis();

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusNanos(1);

        Long totalRequests = safeLong(aiUsageRepository.countRequests(start, end));
        Long successfulRequests = safeLong(aiUsageRepository.countSuccessfulRequests(start, end));
        Long failedRequests = safeLong(aiUsageRepository.countFailedRequests(start, end));
        Long inputTokens = safeLong(aiUsageRepository.sumInputTokens(start, end));
        Long outputTokens = safeLong(aiUsageRepository.sumOutputTokens(start, end));
        Long totalTokens = safeLong(aiUsageRepository.sumTotalTokens(start, end));
        BigDecimal cost = safeBigDecimal(aiUsageRepository.sumEstimatedCost(start, end));
        Double averageResponseTime = safeDouble(aiUsageRepository.averageResponseTime(start, end));
        Integer fastest = aiUsageRepository.minResponseTime(start, end);
        Integer slowest = aiUsageRepository.maxResponseTime(start, end);
        Long activeStudents = safeLong(aiUsageRepository.countActiveStudents(start, end));

        double successRate = calculateRate(successfulRequests, totalRequests);

        log.info("Overview completed in {}ms", System.currentTimeMillis() - startTime);

        return AIUsageOverviewResponse.builder()
                .totalRequests(totalRequests)
                .successfulRequests(successfulRequests)
                .failedRequests(failedRequests)
                .successRate(successRate)
                .totalInputTokens(inputTokens)
                .totalOutputTokens(outputTokens)
                .totalTokens(totalTokens)
                .totalEstimatedCost(cost)
                .averageResponseTimeMs(averageResponseTime)
                .fastestResponseTimeMs(fastest)
                .slowestResponseTimeMs(slowest)
                .activeStudents(activeStudents)
                .build();
    }

    @Override
    public List<AIUsageTimelineResponse> getTimeline(LocalDate from, LocalDate to) {
        log.info("Getting timeline from {} to {}", from, to);

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusNanos(1);

        return aiUsageRepository.statisticsByDate(start, end).stream()
                .map(row -> {
                    LocalDate date;
                    if (row[0] instanceof java.sql.Date sqlDate) {
                        date = sqlDate.toLocalDate();
                    } else if (row[0] instanceof LocalDate localDate) {
                        date = localDate;
                    } else {
                        date = LocalDate.parse(row[0].toString());
                    }

                    return AIUsageTimelineResponse.builder()
                            .date(date)
                            .requests(((Number) row[1]).longValue())
                            .successfulRequests(((Number) row[2]).longValue())
                            .failedRequests(((Number) row[3]).longValue())
                            .inputTokens(((Number) row[4]).longValue())
                            .outputTokens(((Number) row[5]).longValue())
                            .totalTokens(((Number) row[6]).longValue())
                            .estimatedCost(row[7] != null ? new BigDecimal(row[7].toString()) : BigDecimal.ZERO)
                            .averageResponseTimeMs(row[8] != null ? ((Number) row[8]).doubleValue() : 0.0)
                            .build();
                })
                .toList();
    }

    @Override
    public List<AIUsageRequestTypeResponse> getByRequestType(LocalDate from, LocalDate to) {
        log.info("Getting statistics by request type from {} to {}", from, to);

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusNanos(1);

        return aiUsageRepository.statisticsByRequestType(start, end).stream()
                .map(row -> AIUsageRequestTypeResponse.builder()
                        .requestType((RequestType) row[0])
                        .requests(((Number) row[1]).longValue())
                        .successfulRequests(((Number) row[2]).longValue())
                        .failedRequests(((Number) row[3]).longValue())
                        .successRate(calculateRate(((Number) row[2]).longValue(), ((Number) row[1]).longValue()))
                        .inputTokens(((Number) row[4]).longValue())
                        .outputTokens(((Number) row[5]).longValue())
                        .totalTokens(((Number) row[6]).longValue())
                        .estimatedCost(row[7] != null ? new BigDecimal(row[7].toString()) : BigDecimal.ZERO)
                        .averageResponseTimeMs(row[8] != null ? ((Number) row[8]).doubleValue() : 0.0)
                        .build())
                .toList();
    }

    @Override
    public List<AIUsageModelResponse> getByModel(LocalDate from, LocalDate to) {
        log.info("Getting statistics by model from {} to {}", from, to);

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusNanos(1);

        return aiUsageRepository.statisticsByModel(start, end).stream()
                .map(row -> {
                    String provider = row[0] != null ? (String) row[0] : "Unknown";
                    String model = row[1] != null ? (String) row[1] : "Unknown";

                    return AIUsageModelResponse.builder()
                            .provider(provider)
                            .model(model)
                            .requests(((Number) row[2]).longValue())
                            .successfulRequests(((Number) row[3]).longValue())
                            .failedRequests(((Number) row[4]).longValue())
                            .successRate(calculateRate(((Number) row[3]).longValue(), ((Number) row[2]).longValue()))
                            .inputTokens(((Number) row[5]).longValue())
                            .outputTokens(((Number) row[6]).longValue())
                            .totalTokens(((Number) row[7]).longValue())
                            .estimatedCost(row[8] != null ? new BigDecimal(row[8].toString()) : BigDecimal.ZERO)
                            .averageResponseTimeMs(row[9] != null ? ((Number) row[9]).doubleValue() : 0.0)
                            .build();
                })
                .toList();
    }

    @Override
    @Cacheable(value = "aiCostStats", key = "#from + '-' + #to", unless = "#result == null")
    public AIUsageCostResponse getCost(LocalDate from, LocalDate to) {
        log.info("Getting cost statistics from {} to {}", from, to);
        long startTime = System.currentTimeMillis();

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusNanos(1);

        Long requests = safeLong(aiUsageRepository.countRequests(start, end));
        Long inputTokens = safeLong(aiUsageRepository.sumInputTokens(start, end));
        Long outputTokens = safeLong(aiUsageRepository.sumOutputTokens(start, end));
        Long totalTokens = safeLong(aiUsageRepository.sumTotalTokens(start, end));

        BigDecimal totalCost = safeBigDecimal(aiUsageRepository.sumEstimatedCost(start, end));

        BigDecimal inputCost = safeBigDecimal(aiUsageRepository.sumInputCost(start, end));
        BigDecimal outputCost = safeBigDecimal(aiUsageRepository.sumOutputCost(start, end));

        BigDecimal averageCost = requests == 0
                ? BigDecimal.ZERO
                : totalCost.divide(BigDecimal.valueOf(requests), 8, RoundingMode.HALF_UP);

        log.info("Cost statistics completed in {}ms", System.currentTimeMillis() - startTime);

        return AIUsageCostResponse.builder()
                .totalCost(totalCost)
                .averageCostPerRequest(averageCost)
                .inputCost(inputCost)
                .outputCost(outputCost)
                .totalInputTokens(inputTokens)
                .totalOutputTokens(outputTokens)
                .totalTokens(totalTokens)
                .build();
    }

    @Override
    public AIUsagePerformanceResponse getPerformance(LocalDate from, LocalDate to) {
        log.info("Getting performance statistics from {} to {}", from, to);

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusNanos(1);

        Long total = safeLong(aiUsageRepository.countRequests(start, end));
        Long errors = safeLong(aiUsageRepository.countFailedRequests(start, end));
        Long success = safeLong(aiUsageRepository.countSuccessfulRequests(start, end));

        Double averageResponseTime = safeDouble(aiUsageRepository.averageResponseTime(start, end));
        Integer fastest = aiUsageRepository.minResponseTime(start, end);
        Integer slowest = aiUsageRepository.maxResponseTime(start, end);

        return AIUsagePerformanceResponse.builder()
                .successRate(calculateRate(success, total))
                .errorRate(calculateRate(errors, total))
                .averageResponseTimeMs(averageResponseTime)
                .fastestResponseTimeMs(fastest)
                .slowestResponseTimeMs(slowest)
                .totalErrors(errors)
                .build();
    }

    @Override
    public List<AIUsageTopStudentResponse> getTopStudents(LocalDate from, LocalDate to, int limit) {
        log.info("Getting top {} students from {} to {}", limit, from, to);

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusNanos(1);

        return aiUsageRepository.topStudents(start, end).stream()
                .limit(limit)
                .map(row -> AIUsageTopStudentResponse.builder()
                        .studentId(((Number) row[0]).longValue())
                        .studentName((String) row[1])
                        .requests(((Number) row[2]).longValue())
                        .totalTokens(((Number) row[3]).longValue())
                        .estimatedCost(row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO)
                        .build())
                .toList();
    }

    private double calculateRate(Long value, Long total) {
        if (value == null || total == null || total == 0) {
            return 0.0;
        }
        return BigDecimal.valueOf(value)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private Long safeLong(Long value) {
        return value != null ? value : 0L;
    }

    private Double safeDouble(Double value) {
        return value != null ? value : 0.0;
    }

    private BigDecimal safeBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}