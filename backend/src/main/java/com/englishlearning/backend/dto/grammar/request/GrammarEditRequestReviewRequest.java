package com.englishlearning.backend.dto.grammar.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarEditRequestReviewRequest {

    // Chỉ dùng khi từ chối — có thể null
    private String note;
}