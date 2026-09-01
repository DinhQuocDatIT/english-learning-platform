package com.englishlearning.backend.dto.response.gemini;
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
public class GeminiError {
    private Integer code;
    private String message;
    private String status;
}