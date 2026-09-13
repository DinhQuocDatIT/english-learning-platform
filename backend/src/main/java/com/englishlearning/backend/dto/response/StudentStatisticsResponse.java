package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatisticsResponse {

    private Long studentId;
    private String fullName;

    private Overview overview;
    private LevelRanking levelRanking;
    private PracticeStats practice;
    private ListeningStats listening;
    private VocabularyStats vocabulary;
    private List<ErrorStat> topErrors;
    private List<DailyActivity> weeklyActivity;
    private AIUsageStats aiUsage;

    // =====================================================
    // NESTED CLASSES
    // =====================================================

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Overview {
        private Integer totalXp;
        private Integer totalCompletedTopics;
        private Integer totalLearningSeconds;
        private Double overallAccuracy;
        private Integer totalActivities;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LevelRanking {
        private Integer level;
        private String title;
        private String titleEmoji;
        private String levelColor;
        private Double progressPercent;
        private Integer xpRemaining;
        private Integer ranking;
        private Double topPercent;
        private Long totalStudents;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PracticeStats {
        private Long totalSessions;
        private Long completedSessions;
        private Long inProgressSessions;
        private Long totalQuestions;
        private Long totalCorrect;
        private Double accuracyRate;
        private Double averageScore;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListeningStats {
        private Long totalAnswers;
        private Long correctAnswers;
        private Double accuracyRate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VocabularyStats {
        private Long total;
        private Long learned;
        private Long learning;
        private Long notLearned;
        private Double learnedPercent;
    }

    /**
     * ErrorStat — MỞ RỘNG để giúp học sinh CẢI THIỆN
     *
     * Giữ nguyên các field cũ + thêm:
     * - Phân loại chi tiết: errorCategory, errorSubtype, errorKey
     * - Giải thích: description, example, suggestion
     * - Tiến bộ: masteryScore, masteryLevel
     * - Xu hướng: trend, severity
     * - Thời gian: firstOccurredAt, lastOccurredAt
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorStat {
        // ============ CŨ — GIỮ NGUYÊN ============
        private String errorType;
        private String displayName;
        private Long count;
        private Long highSeverity;
        private Long mediumSeverity;
        private Long lowSeverity;

        // ============ MỚI — PHÂN LOẠI CHI TIẾT ============
        private String errorCategory;
        private String errorSubtype;
        private String errorKey;

        // ============ MỚI — GIẢI THÍCH ============
        private String description;
        private String example;
        private String suggestion;

        // ============ MỚI — TIẾN BỘ ============
        private Integer masteryScore;
        private String masteryLevel;

        // ============ MỚI — XU HƯỚNG ============
        private String trend;
        private String severity;

        // ============ MỚI — THỜI GIAN ============
        private LocalDateTime firstOccurredAt;
        private LocalDateTime lastOccurredAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyActivity {
        private LocalDate date;
        private Long questionCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIUsageStats {
        private Long totalRequests;
    }
}