package com.englishlearning.backend.dto.response.studentprofile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsInfoResponse {

    // ===== XP / RANKING =====
    private int totalXp;
    private int totalCompletedTopics;
    private int totalLearningSeconds;
    private double accuracyRate;
    private Integer ranking;
    private Double topPercent;
    private long totalStudents;

    // ===== LISTENING =====
    private long totalListeningAnswers;
    private long totalListeningCorrect;

    // ===== AI PRACTICE =====
    private long totalAiAnswers;
    private long totalAiCorrect;
    private double avgAiScore;
    private long totalSessions;
    private long completedSessions;
    private long inProgressSessions;

    // ===== CONVERSATION (MỚI) =====
    private long totalConversations;
    private long activeConversations;
    private long totalMessages;
    private long correctMessages;
    private long errorMessages;
    private double conversationAccuracy;
}