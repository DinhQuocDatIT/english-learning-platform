package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIUsage;
import com.englishlearning.backend.enums.RequestType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIUsageRepository extends JpaRepository<AIUsage, Long> {

    List<AIUsage> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<AIUsage> findByPracticeChatId(Long practiceChatId);

    // ===== THỐNG KÊ CƠ BẢN =====

    @Query("SELECT COUNT(u) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    long countByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(u.totalTokens), 0) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Long sumTokensByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(u.estimatedCost), 0) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Double sumCostByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(AVG(u.responseTimeMs), 0) FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Double avgResponseTimeByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // ===== THỐNG KÊ THEO PROVIDER =====

    @Query("SELECT u.provider, COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end GROUP BY u.provider")
    List<Object[]> statsByProvider(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // ===== THỐNG KÊ THEO MODEL =====

    @Query("SELECT u.model, COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u " +
            "WHERE u.createdAt BETWEEN :start AND :end " +
            "GROUP BY u.model ORDER BY COALESCE(SUM(u.estimatedCost), 0) DESC")
    List<Object[]> statsByModel(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // ===== THỐNG KÊ THEO REQUEST TYPE =====

    @Query("SELECT u.requestType, COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end GROUP BY u.requestType")
    List<Object[]> statsByRequestType(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // ===== THỐNG KÊ THEO NGÀY =====

    @Query(value = "SELECT DATE(u.created_at) as date, COUNT(*), COALESCE(SUM(u.total_tokens), 0), " +
            "COALESCE(SUM(u.estimated_cost), 0), COALESCE(AVG(u.response_time_ms), 0), " +
            "COALESCE(SUM(CASE WHEN u.success = true THEN 1 ELSE 0 END), 0) " +
            "FROM ai_usage u " +
            "WHERE u.created_at BETWEEN :start AND :end " +
            "GROUP BY DATE(u.created_at) " +
            "ORDER BY DATE(u.created_at) DESC", nativeQuery = true)
    List<Object[]> dailyStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // ===== THỐNG KÊ TOÀN BỘ (TỔNG HỢP) =====

    @Query("SELECT COALESCE(SUM(u.inputTokens), 0), COALESCE(SUM(u.outputTokens), 0), " +
            "COALESCE(SUM(u.totalTokens), 0), COUNT(u), " +
            "COALESCE(SUM(CASE WHEN u.success = true THEN 1 ELSE 0 END), 0), " +
            "COALESCE(SUM(u.estimatedCost), 0), COALESCE(AVG(u.responseTimeMs), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Object[] getOverallStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // ===== LẤY DANH SÁCH CÓ PHÂN TRANG =====

    @Query("SELECT u FROM AIUsage u ORDER BY u.createdAt DESC")
    Page<AIUsage> findAllOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT u FROM AIUsage u WHERE u.student.id = :studentId ORDER BY u.createdAt DESC")
    Page<AIUsage> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId, Pageable pageable);

    // ===== THỐNG KÊ THEO GIÁO VIÊN (nếu có) =====

    @Query("SELECT u.provider, COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end AND u.provider = :provider " +
            "GROUP BY u.model")
    List<Object[]> statsByProviderAndModel(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end,
                                           @Param("provider") String provider);

    // ============================================
    // ✅ THỐNG KÊ CHO DASHBOARD
    // ============================================

    /**
     * Lấy tổng quan
     */
    @Query("SELECT COUNT(u), COALESCE(SUM(u.totalTokens), 0), COALESCE(SUM(u.estimatedCost), 0), " +
            "COALESCE(AVG(u.responseTimeMs), 0) " +
            "FROM AIUsage u " +
            "WHERE u.createdAt BETWEEN :start AND :end")
    Object[] getOverviewStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Lấy dữ liệu biểu đồ theo ngày
     */
    @Query(value = "SELECT DATE(u.created_at) as date, COUNT(*), COALESCE(SUM(u.total_tokens), 0), " +
            "COALESCE(SUM(u.estimated_cost), 0) " +
            "FROM ai_usage u " +
            "WHERE u.created_at BETWEEN :start AND :end " +
            "GROUP BY DATE(u.created_at) " +
            "ORDER BY DATE(u.created_at) ASC", nativeQuery = true)
    List<Object[]> getDailyChartData(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Lấy báo cáo theo tháng
     */
    @Query(value = "SELECT DATE_FORMAT(u.created_at, '%m/%Y') as month, " +
            "COUNT(*), COALESCE(SUM(u.total_tokens), 0), COALESCE(SUM(u.estimated_cost), 0) " +
            "FROM ai_usage u " +
            "WHERE u.created_at BETWEEN :start AND :end " +
            "GROUP BY DATE_FORMAT(u.created_at, '%m/%Y') " +
            "ORDER BY DATE_FORMAT(u.created_at, '%m/%Y') ASC", nativeQuery = true)
    List<Object[]> getMonthlyReport(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Lấy Top học viên
     */
    @Query("SELECT u.student.id, u.student.user.fullName, COUNT(u), COALESCE(SUM(u.totalTokens), 0), " +
            "COALESCE(SUM(u.estimatedCost), 0) " +
            "FROM AIUsage u " +
            "WHERE u.createdAt BETWEEN :start AND :end AND u.student IS NOT NULL " +
            "GROUP BY u.student.id, u.student.user.fullName " +
            "ORDER BY COALESCE(SUM(u.estimatedCost), 0) DESC")
    List<Object[]> getTopStudents(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end,
                                  Pageable pageable);

    // ===== THỐNG KÊ TỶ LỆ THÀNH CÔNG =====

    @Query("SELECT COUNT(u), " +
            "COALESCE(SUM(CASE WHEN u.success = true THEN 1 ELSE 0 END), 0), " +
            "COALESCE(SUM(CASE WHEN u.success = false THEN 1 ELSE 0 END), 0) " +
            "FROM AIUsage u WHERE u.createdAt BETWEEN :start AND :end")
    Object[] getSuccessStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}