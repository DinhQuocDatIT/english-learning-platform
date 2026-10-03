package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTipResponse {
    private Long id;
    private Long topicId;
    private String title;
    private String content;
    private List<String> applySteps;
    private String question;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private Integer displayOrder;
    private String status;
}