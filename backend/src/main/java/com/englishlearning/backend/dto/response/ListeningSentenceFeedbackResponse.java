package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ListeningSentenceFeedbackResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long listeningSentenceId;
    private String listeningSentenceText;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}