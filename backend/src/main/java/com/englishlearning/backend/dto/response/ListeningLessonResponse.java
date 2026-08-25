package com.englishlearning.backend.dto.response;

import com.englishlearning.backend.enums.ListeningLessonStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ListeningLessonResponse {

    private Long id;
    private Long topicId;
    private String topicTitle;
    private Long levelId;
    private String levelName;
    private String levelColor;
    private Long createdById;
    private String createdByName;
    private String title;
    private String description;
    private ListeningLessonStatus status;
    private Boolean isPremium;
    private String lessonImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}