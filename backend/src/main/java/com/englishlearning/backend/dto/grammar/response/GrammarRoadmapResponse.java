package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarRoadmapResponse {
    private Long id;
    private String name;
    private String subtitle;
    private Integer level;
    private String levelLabel;
    private String description;
    private String color;
    private Integer totalTopics;
    private Integer totalQuestions;
    private List<GrammarTopicResponse> topics = new ArrayList<>();
}