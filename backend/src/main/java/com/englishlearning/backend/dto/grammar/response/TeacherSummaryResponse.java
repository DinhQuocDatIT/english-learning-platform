package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private Long topicCount;
}