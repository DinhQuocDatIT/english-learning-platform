package com.englishlearning.backend.dto.request.gemini;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public  class GeminiPart {
    private String text;
}