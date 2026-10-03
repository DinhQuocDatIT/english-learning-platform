package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarExampleResponse {
    private Long id;
    private Long topicId;
    private String sentenceEn;
    private String sentenceVi;
    private String note;
    private Integer displayOrder;
    private String status;
}