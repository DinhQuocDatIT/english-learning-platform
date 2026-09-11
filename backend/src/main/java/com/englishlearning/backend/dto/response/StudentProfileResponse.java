package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class StudentProfileResponse {

    private UserInfo user;
    private LevelInfo level;
    private StatsInfo stats;
    private MembershipInfo membership;
    private List<WeaknessInfo> weaknesses;
    private VocabularyInfo vocabulary;

    // =====================================================
    // USER INFO
    // =====================================================
    @Getter
    @Setter
    @Builder
    public static class UserInfo {
        private Long id;
        private String fullName;
        private String email;
        private String gender;
        private LocalDate dateOfBirth;
        private LocalDateTime joinDate;
        private String avatarInitial;
    }

    // =====================================================
    // LEVEL INFO
    // =====================================================
    @Getter
    @Setter
    @Builder
    public static class LevelInfo {
        private Integer level;
        private String title;
        private String titleEmoji;
        private String levelColor;
        private Integer totalXp;
        private Integer currentXpInLevel;
        private Integer xpForNextLevel;
        private Integer xpRemaining;
        private Integer totalXpForNextLevel;
        private Double progressPercent;
    }

    // =====================================================
    // STATS INFO
    // =====================================================
    @Getter
    @Setter
    @Builder
    public static class StatsInfo {
        private Integer totalXp;
        private Integer totalCompletedTopics;
        private Double accuracyRate;
        private Integer ranking;
        private Long totalListeningAnswers;
        private Long totalAiAnswers;
    }

    // =====================================================
    // MEMBERSHIP INFO
    // =====================================================
    @Getter
    @Setter
    @Builder
    public static class MembershipInfo {
        private Boolean hasMembership;
        private String packageName;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long remainingDays;
        private AiUsageInfo aiUsage;
    }

    @Getter
    @Setter
    @Builder
    public static class AiUsageInfo {
        private Integer limit;
        private Integer used;
        private Integer remaining;
        private Double percent;
        private Boolean canMakeRequest;
    }

    // =====================================================
    // WEAKNESS INFO
    // =====================================================
    @Getter
    @Setter
    @Builder
    public static class WeaknessInfo {
        private String errorType;
        private String displayName;
        private Integer occurrenceCount;
        private Integer correctedCount;
        private Integer masteryScore;
        private String level;
        private String suggestion;
        private String exampleWrong;
        private String exampleCorrect;
        private String explanation;
    }

    // =====================================================
    // VOCABULARY INFO
    // =====================================================
    @Getter
    @Setter
    @Builder
    public static class VocabularyInfo {
        private Long total;
        private Long learned;
        private Long learning;
        private Long notLearned;
        private List<String> recentWords;
    }
}