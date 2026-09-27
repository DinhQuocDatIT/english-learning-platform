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

    private Integer totalXp;
    private Integer totalCompletedTopics;
    private Integer totalLearningSeconds;

    private Double accuracyRate;

    private Integer ranking;
    private Double topPercent;
    private Long totalStudents;

    private Long totalListeningAnswers;
    private Long totalListeningCorrect;

    private Long totalAiAnswers;
    private Long totalAiCorrect;
    private Double avgAiScore;

    private Long totalSessions;
    private Long completedSessions;
    private Long inProgressSessions;
}