package com.englishlearning.backend.dto.grammar.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTipRequest {

    @NotNull(message = "TopicId không được để trống")
    private Long topicId;

    @NotBlank(message = "Tiêu đề mẹo không được để trống")
    private String title;

    private String content;

    private List<String> applySteps;

    private String question;

    private List<String> options;

    // "A" / "B" / "C" / "D"
    private String correctAnswer;

    private String explanation;

    private Integer displayOrder;
}