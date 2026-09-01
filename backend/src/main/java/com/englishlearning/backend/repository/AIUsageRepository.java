package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIUsage;
import com.englishlearning.backend.enums.RequestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface AIUsageRepository extends JpaRepository<AIUsage, Long> {
    List<AIUsage> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<AIUsage> findByPracticeChatId(Long practiceChatId);
    // Thống kê cho admin
    @Query("SELECT COUNT(u) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    long countByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query("SELECT SUM(u.totalTokens) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Long sumTokensByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query("SELECT SUM(u.estimatedCost) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Double sumCostByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query("SELECT AVG(u.responseTimeMs) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Double avgResponseTimeByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    // Thống kê theo provider
    @Query("SELECT u.provider, COUNT(u), SUM(u.totalTokens), SUM(u.estimatedCost) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end GROUP BY u.provider")
    List<Object[]> statsByProvider(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}