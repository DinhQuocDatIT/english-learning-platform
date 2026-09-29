package com.englishlearning.backend.dto.grammar.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopicRequest {
    private Long roadmapId;
    private String name;
    private String slug;
    private String description;
    private Integer displayOrder;
}