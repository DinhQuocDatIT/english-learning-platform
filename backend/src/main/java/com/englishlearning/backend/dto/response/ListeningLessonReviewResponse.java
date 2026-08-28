package com.englishlearning.backend.dto.response;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ListeningLessonReviewResponse {

    private Long id;
    private Long listeningLessonId;
    private String listeningLessonTitle;
    private String action;
    private String reason;
    private LocalDateTime createdAt;
}