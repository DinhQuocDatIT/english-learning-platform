package com.englishlearning.backend.dto.grammar.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarExampleRequest {

    @NotNull(message = "TopicId không được để trống")
    private Long topicId;

    @NotBlank(message = "Câu tiếng Anh không được để trống")
    private String sentenceEn;

    private String sentenceVi;

    private String note;

    private Integer displayOrder;
}