package com.englishlearning.backend.dto.response.gemini;

import com.englishlearning.backend.dto.request.gemini.GeminiContent;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiCandidate {
    private GeminiContent content;
    private String finishReason;
    private Integer index;
}
