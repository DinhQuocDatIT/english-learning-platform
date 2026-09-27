package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopicResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Integer displayOrder;
    private Integer totalQuestions;
    private String icon;
    private Long parentId;
    private String status;
    private List<GrammarTopicResponse> children = new ArrayList<>();
}