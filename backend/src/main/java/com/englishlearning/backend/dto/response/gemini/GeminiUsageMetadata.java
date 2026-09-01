package com.englishlearning.backend.dto.response.gemini;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiUsageMetadata {
    private Integer promptTokenCount;
    private Integer candidatesTokenCount;
    private Integer totalTokenCount;
}