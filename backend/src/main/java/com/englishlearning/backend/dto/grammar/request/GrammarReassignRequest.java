package com.englishlearning.backend.dto.grammar.request;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarReassignRequest {
    private List<Long> topicIds;
    private Long newOwnerId;
}