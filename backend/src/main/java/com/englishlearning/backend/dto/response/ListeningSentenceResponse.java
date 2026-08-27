// ListeningSentenceResponse.java
package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ListeningSentenceResponse {
    private Long id;
    private Long listeningLessonId;
    private String englishText;
    private Integer sentenceOrder;
    private String vietnameseMeaning;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}