package com.englishlearning.backend.dto.request.gemini;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
 public class GeminiContent {
    private List<GeminiPart> parts;
    private String role;
}