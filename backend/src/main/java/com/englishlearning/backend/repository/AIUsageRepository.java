package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIUsage;
import com.englishlearning.backend.enums.RequestType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIUsageRepository extends JpaRepository<AIUsage, Long> {

    List<AIUsage> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<AIUsage> findByPracticeChatId(Long practiceChatId);

    @Query("SELECT COUNT(u) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    long countByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(u.totalTokens), 0) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Long sumTokensByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(u.estimatedCost), 0) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    BigDecimal sumCostByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(AVG(u.responseTimeMs), 0) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Double avgResponseTimeByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT u.provider, COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end GROUP BY u.provider")
    List<Object[]> statsByProvider(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT u.model, COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end " +
            "GROUP BY u.model ORDER BY COALESCE(SUM(u.estimatedCost), 0) DESC")
    List<Object[]> statsByModel(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT u.requestType, COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end GROUP BY u.requestType")
    List<Object[]> statsByRequestType(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT DATE(u.created_at) as date, COUNT(*), COALESCE(SUM(u.total_tokens), 0), " +
            "COALESCE(SUM(u.estimated_cost), 0), COALESCE(AVG(u.response_time_ms), 0), " +
            "COALESCE(SUM(CASE WHEN u.success = true THEN 1 ELSE 0 END), 0) " +
            "FROM ai_usage u " +
            "WHERE u.created_at BETWEEN :start AND :end " +
            "GROUP BY DATE(u.created_at) " +
            "ORDER BY DATE(u.created_at) DESC", nativeQuery = true)
    List<Object[]> dailyStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(u.inputTokens), 0), COALESCE(SUM(u.outputTokens), 0), " +
            "COALESCE(SUM(u.totalTokens), 0), COUNT(u), " +
            "COALESCE(SUM(CASE WHEN u.success = true THEN 1 ELSE 0 END), 0), " +
            "COALESCE(SUM(u.estimatedCost), 0), COALESCE(AVG(u.responseTimeMs), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Object[] getOverallStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT u FROM AIUsage u ORDER BY u.createdAt DESC")
    Page<AIUsage> findAllOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT u FROM AIUsage u WHERE u.student.id = :studentId ORDER BY u.createdAt DESC")
    Page<AIUsage> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId, Pageable pageable);

    @Query("SELECT COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0), " +
            "COALESCE(AVG(u.responseTimeMs), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Object[] getOverviewStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT DATE(u.created_at) as date, COUNT(*), COALESCE(SUM(u.total_tokens), 0), " +
            "COALESCE(SUM(u.estimated_cost), 0) " +
            "FROM ai_usage u " +
            "WHERE u.created_at BETWEEN :start AND :end " +
            "GROUP BY DATE(u.created_at) " +
            "ORDER BY DATE(u.created_at) ASC", nativeQuery = true)
    List<Object[]> getDailyChartData(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT DATE_FORMAT(u.created_at, '%m/%Y') as month, " +
            "COUNT(*), COALESCE(SUM(u.total_tokens), 0), COALESCE(SUM(u.estimated_cost), 0) " +
            "FROM ai_usage u " +
            "WHERE u.created_at BETWEEN :start AND :end " +
            "GROUP BY DATE_FORMAT(u.created_at, '%m/%Y') " +
            "ORDER BY DATE_FORMAT(u.created_at, '%m/%Y') ASC", nativeQuery = true)
    List<Object[]> getMonthlyReport(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT u.student.id, COALESCE(u.student.user.fullName, 'Unknown'), " +
            "COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u " +
            "WHERE u.createdAt BETWEEN :start AND :end " +
            "AND u.student IS NOT NULL " +
            "AND u.student.user IS NOT NULL " +
            "GROUP BY u.student.id, u.student.user.fullName " +
            "ORDER BY COUNT(u) DESC")
    List<Object[]> getTopStudents(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end,
                                  Pageable pageable);

    @Query("SELECT COUNT(u), " +
            "COALESCE(SUM(CASE WHEN u.success = true THEN 1 ELSE 0 END), 0), " +
            "COALESCE(SUM(CASE WHEN u.success = false THEN 1 ELSE 0 END), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Object[] getSuccessStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    Long countRequests(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(a) FROM AIUsage a WHERE a.success = true AND a.createdAt BETWEEN :from AND :to")
    Long countSuccessfulRequests(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(a) FROM AIUsage a WHERE a.success = false AND a.createdAt BETWEEN :from AND :to")
    Long countFailedRequests(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(a.inputTokens), 0) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    Long sumInputTokens(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(a.outputTokens), 0) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    Long sumOutputTokens(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(a.totalTokens), 0) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    Long sumTotalTokens(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(a.estimatedCost), 0.0) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    BigDecimal sumEstimatedCost(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(a.inputTokens * COALESCE(a.inputPricePerMillion, 0.0) / 1000000.0), 0.0) " +
            "FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    BigDecimal sumInputCost(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(a.outputTokens * COALESCE(a.outputPricePerMillion, 0.0) / 1000000.0), 0.0) " +
            "FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    BigDecimal sumOutputCost(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(AVG(a.responseTimeMs), 0) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    Double averageResponseTime(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT MIN(a.responseTimeMs) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    Integer minResponseTime(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT MAX(a.responseTimeMs) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to")
    Integer maxResponseTime(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(DISTINCT a.student.id) FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to AND a.student IS NOT NULL")
    Long countActiveStudents(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.requestType, COUNT(a), " +
            "SUM(CASE WHEN a.success = true THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN a.success = false THEN 1 ELSE 0 END), " +
            "SUM(a.inputTokens), SUM(a.outputTokens), SUM(a.totalTokens), " +
            "SUM(a.estimatedCost), AVG(CASE WHEN a.success = true THEN a.responseTimeMs END) " +
            "FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to GROUP BY a.requestType")
    List<Object[]> statisticsByRequestType(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.provider, a.model, COUNT(a), " +
            "SUM(CASE WHEN a.success = true THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN a.success = false THEN 1 ELSE 0 END), " +
            "SUM(a.inputTokens), SUM(a.outputTokens), SUM(a.totalTokens), " +
            "SUM(a.estimatedCost), AVG(CASE WHEN a.success = true THEN a.responseTimeMs END) " +
            "FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to " +
            "GROUP BY a.provider, a.model ORDER BY COUNT(a) DESC")
    List<Object[]> statisticsByModel(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.student.id, COALESCE(a.student.user.fullName, 'Unknown User'), " +
            "COUNT(a), COALESCE(SUM(a.totalTokens), 0), COALESCE(SUM(a.estimatedCost), 0) " +
            "FROM AIUsage a WHERE a.createdAt BETWEEN :from AND :to " +
            "AND a.student IS NOT NULL AND a.student.user IS NOT NULL " +
            "GROUP BY a.student.id, a.student.user.fullName ORDER BY COUNT(a) DESC")
    List<Object[]> topStudents(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT DATE(created_at) AS usage_date, COUNT(*) AS requests, " +
            "SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful_requests, " +
            "SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS failed_requests, " +
            "COALESCE(SUM(input_tokens), 0) AS input_tokens, " +
            "COALESCE(SUM(output_tokens), 0) AS output_tokens, " +
            "COALESCE(SUM(total_tokens), 0) AS total_tokens, " +
            "COALESCE(SUM(estimated_cost), 0) AS estimated_cost, " +
            "COALESCE(AVG(response_time_ms), 0) AS average_response_time " +
            "FROM ai_usage WHERE created_at BETWEEN :from AND :to " +
            "GROUP BY DATE(created_at) ORDER BY DATE(created_at)", nativeQuery = true)
    List<Object[]> statisticsByDate(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}