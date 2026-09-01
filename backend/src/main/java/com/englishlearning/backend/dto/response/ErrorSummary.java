package com.englishlearning.backend.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorSummary {
    private String errorType;
    private Integer count;
    private String example;
}
