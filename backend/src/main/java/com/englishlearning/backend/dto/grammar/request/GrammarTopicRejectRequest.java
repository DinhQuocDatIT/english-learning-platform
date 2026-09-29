package com.englishlearning.backend.dto.grammar.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GrammarTopicRejectRequest {
    private String reason;
}