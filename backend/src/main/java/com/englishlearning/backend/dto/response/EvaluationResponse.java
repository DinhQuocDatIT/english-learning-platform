package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponse {

    // Evaluation
    private Boolean isCorrect;
    private Integer score;
    private Integer naturalnessScore;
    private String feedback;
    private List<BetterAnswer> betterAnswers;

    // Errors
    private List<ErrorDetail> errors;

    // Next question
    private TurnResponse nextQuestion;

    // Practice progress
    private Integer questionCount;
    private Integer totalQuestions;
    private Boolean isCompleted;
}



