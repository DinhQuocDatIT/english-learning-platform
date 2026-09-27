package com.englishlearning.backend.dto.grammar.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarRoadmapRequest {
    private String name;            // "TOEIC 600"
    private String subtitle;        // "NỀN TẢNG VỮNG CHẮC"
    private Integer level;          // 1, 2, 3
    private String levelLabel;      // "Cấp độ 1 - Cơ bản"
    private String description;
    private String color;           // "#3b82f6"
    private Integer displayOrder;
}