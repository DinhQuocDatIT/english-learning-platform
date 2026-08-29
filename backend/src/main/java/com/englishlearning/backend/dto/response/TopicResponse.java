package com.englishlearning.backend.dto.response;

import com.englishlearning.backend.enums.TopicStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TopicResponse {

    private Long id;

    private String title;

    private String description;

    private String topicImage;

    private TopicStatus status;

    private Long createdById;
    private Integer lessonCount;
    private String createdByName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}