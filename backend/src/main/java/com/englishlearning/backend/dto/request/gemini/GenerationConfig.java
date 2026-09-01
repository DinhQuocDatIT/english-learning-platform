package com.englishlearning.backend.dto.request.gemini;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerationConfig {
    private Double temperature;
    private Integer maxOutputTokens;
    private String responseMimeType;
}