package com.englishlearning.backend.dto.response.gemini;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiResponse {
    private List<GeminiCandidate> candidates;
    private GeminiUsageMetadata usageMetadata;
}