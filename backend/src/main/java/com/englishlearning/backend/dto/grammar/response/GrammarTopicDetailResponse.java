package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopicDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Integer displayOrder;
    private String status;

    // ===== THÔNG TIN OWNER =====
    private Long createdById;
    private String createdByName;
    private Boolean isOwner;

    private List<GrammarTheoryResponse> theories = new ArrayList<>();
}