package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIErrorResponse {

    private String errorType;    // GRAMMAR, VOCABULARY, ARTICLE, etc.
    private String userText;
    private String correctText;
    private String explanation;
    private String severity;     // HIGH, MEDIUM, LOW
}