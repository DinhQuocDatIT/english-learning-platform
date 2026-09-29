package com.englishlearning.backend.dto.grammar.response;

import com.englishlearning.backend.entity.GrammarTopicReview;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopicReviewResponse {

    private Long id;
    private String action;
    private String reason;
    private Long performedById;
    private String performedByName;
    private LocalDateTime performedAt;

    public static GrammarTopicReviewResponse from(GrammarTopicReview h) {
        return GrammarTopicReviewResponse.builder()
                .id(h.getId())
                .action(h.getAction().name())
                .reason(h.getReason())
                .performedById(h.getPerformedBy().getId())
                .performedByName(h.getPerformedBy().getFullName())
                .performedAt(h.getPerformedAt())
                .build();
    }
}