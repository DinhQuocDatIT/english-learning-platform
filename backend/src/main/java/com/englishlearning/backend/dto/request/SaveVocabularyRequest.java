package com.englishlearning.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SaveVocabularyRequest {

    @NotBlank(message = "Từ vựng không được để trống")
    @Size(max = 255, message = "Từ vựng không được vượt quá 255 ký tự")
    private String word;

    @Size(max = 255, message = "Phát âm không được vượt quá 255 ký tự")
    private String pronunciation;

    @Valid
    @NotEmpty(message = "Phải có ít nhất một nghĩa")
    private List<VocabularyMeaningRequest> meanings;
}