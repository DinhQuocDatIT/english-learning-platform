package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListeningSentenceFeedbackRequest {

    @NotNull(message = "ID câu nghe là bắt buộc")
    private Long listeningSentenceId;

    @NotBlank(message = "Nội dung phản hồi là bắt buộc")
    private String content;
}