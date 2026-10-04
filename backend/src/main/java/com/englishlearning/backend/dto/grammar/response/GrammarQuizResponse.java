package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarQuizResponse {

    private Long id;
    private Long topicId;
    private String title;
    private String description;
    private Integer displayOrder;
    private String status;
    private Integer totalQuestions;

    private List<GrammarQuizQuestionResponse> questions;
}