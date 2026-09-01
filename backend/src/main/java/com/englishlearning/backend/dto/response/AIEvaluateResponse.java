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
public class AIEvaluateResponse {

    // Evaluation
    private Boolean isCorrect;
    private Integer score;
    private Integer naturalnessScore;
    private String feedback;
    private List<String> betterAnswers;

    // Errors
    private List<AIErrorResponse> errors;

    // Next question (if generate next)
    private AIGenerateResponse nextQuestion;
}