package com.englishlearning.backend.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorDetail {
    private String errorType;
    private String userText;
    private String correctText;
    private String explanation;
    private String severity;
}