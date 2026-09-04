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
public class TurnHistoryResponse {
    private Long id;
    private Integer questionOrder;
    private String vietnameseSentence;
    private String studentAnswer;
    private Integer score;
    private Boolean isCorrect;
    private String feedback;
    private Integer naturalnessScore;
    private List<ErrorDetail> errors;
}