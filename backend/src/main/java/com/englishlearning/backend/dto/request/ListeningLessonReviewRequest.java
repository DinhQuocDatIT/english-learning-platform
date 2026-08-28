package com.englishlearning.backend.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListeningLessonReviewRequest {

    @NotNull(message = "ID bài nghe không được để trống")
    private Long listeningLessonId;

    @NotBlank(message = "Hành động không được để trống")
    private String action; // APPROVE, REJECT, PUBLISH

    private String reason;
}