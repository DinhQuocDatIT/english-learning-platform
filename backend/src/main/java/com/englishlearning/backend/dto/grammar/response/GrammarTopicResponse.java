package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

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
    private String status;
}