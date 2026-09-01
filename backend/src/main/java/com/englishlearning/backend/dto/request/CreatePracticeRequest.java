package com.englishlearning.backend.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePracticeRequest {
    @NotBlank(message = "Level is required")
    private String level;
    @NotBlank(message = "Sentence type is required")
    private String sentenceType;
    @NotBlank(message = "Topic is required")
    private String topic;
    private Integer questionLimit = 20;
    private List<String> vocabularyWords;
}