package com.englishlearning.backend.dto.grammar.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTheoryRequest {
    private Long topicId;
    private String title;           // "Định nghĩa", "Công thức", ...
    private String sectionType;     // TEXT / TABLE / LIST / NOTE
    private String content;         // dùng cho TEXT/NOTE
    private Object metadata;        // dùng cho TABLE/LIST — sẽ serialize thành JSON
    private Integer displayOrder;
}