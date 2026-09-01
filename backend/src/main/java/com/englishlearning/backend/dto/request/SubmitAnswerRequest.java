package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {
    @NotNull(message = "Turn ID is required")
    private Long turnId;
    @NotBlank(message = "Answer is required")
    @Size(max = 1000, message = "Answer too long")
    private String studentAnswer;
}