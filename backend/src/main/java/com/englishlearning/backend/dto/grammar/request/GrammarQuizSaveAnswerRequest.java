package com.englishlearning.backend.dto.grammar.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarQuizSaveAnswerRequest {

    @NotNull(message = "QuestionId không được để trống")
    private Long questionId;

    // "A" / "B" / "C" / "D"
    @NotBlank(message = "Đáp án không được để trống")
    private String answer;
}