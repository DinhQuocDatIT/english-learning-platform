package com.englishlearning.backend.dto.grammar.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopicRequest {
    private Long roadmapId;
    private Long parentId;          // nullable — null = topic gốc
    private String name;
    private String slug;
    private String description;
    private Integer displayOrder;
    private Integer totalQuestions;
    private String icon;
}