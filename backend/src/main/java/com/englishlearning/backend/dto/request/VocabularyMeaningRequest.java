package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class VocabularyMeaningRequest {
    @NotBlank(message = "Từ loại không được để trống")
    @Size(max = 50, message = "Từ loại không được vượt quá 50 ký tự")
    private String partOfSpeech;

    @NotBlank(message = "Nghĩa của từ không được để trống")
    @Size(max = 1000, message = "Nghĩa của từ không được vượt quá 1000 ký tự")
    private String meaning;

    @Size(max = 1000, message = "Ví dụ không được vượt quá 1000 ký tự")
    private String example;
}