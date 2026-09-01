package com.englishlearning.backend.dto.request.gemini;

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
public class GeminiRequest {

    private List<GeminiContent> contents;
    private GenerationConfig generationConfig;
}





