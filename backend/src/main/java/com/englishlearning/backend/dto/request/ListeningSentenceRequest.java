package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListeningSentenceRequest {

    @NotNull(message = "Bài nghe không được để trống")
    private Long listeningLessonId;

    @NotBlank(message = "Nội dung tiếng Anh không được để trống")
    private String englishText;

    @NotNull(message = "Thứ tự câu không được để trống")
    private Integer sentenceOrder;

    private String vietnameseMeaning;
}