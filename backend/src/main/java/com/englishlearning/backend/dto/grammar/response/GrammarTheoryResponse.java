package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTheoryResponse {
    private Long id;
    private Long topicId;
    private String title;
    private String sectionType;
    private String content;
    private Object metadata;        // đã parse từ JSON string → Object
    private Integer displayOrder;
    private String status;          // DRAFT / PUBLISHED / ...
}