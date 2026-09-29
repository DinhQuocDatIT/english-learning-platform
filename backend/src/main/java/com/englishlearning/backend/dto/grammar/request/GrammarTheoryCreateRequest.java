package com.englishlearning.backend.dto.grammar.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTheoryCreateRequest {

    private Long topicId;
    private String title;
    private String sectionType;     // TEXT / TABLE / LIST / NOTE
    private String content;
    private Object metadata;        // Object → serialize JSON
    private Integer displayOrder;

    // ===== HỖ TRỢ TẠO NHIỀU SECTION 1 LÚC =====
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BatchCreateRequest {
        private List<GrammarTheoryCreateRequest> sections;
    }
}