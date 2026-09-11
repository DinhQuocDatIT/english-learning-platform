package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
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
     * ErrorStat gọn: chỉ tên + số lần + mức độ
     * KHÔNG có example, suggestion, explanation
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorStat {
        private String errorType;
        private String displayName;
        private Long count;
        private Long highSeverity;
        private Long mediumSeverity;
        private Long lowSeverity;
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