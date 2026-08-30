package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ListeningAnswerResponse {

    private Long id;
    private Long listeningSentenceId;
    private String listeningSentenceText;
    private Long studentId;
    private String studentName;
    private String userText;
    private String correctText;
    private Boolean isCorrect;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Integer experienceEarned;
}