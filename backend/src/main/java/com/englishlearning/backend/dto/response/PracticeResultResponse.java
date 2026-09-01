package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeResultResponse {

    private Long practiceId;
    private String level;
    private String topic;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Double accuracy;
    private Double averageScore;
    private LocalDateTime completedAt;
    private List<ErrorSummary> commonErrors;
}

