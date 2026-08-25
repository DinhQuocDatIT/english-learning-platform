package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UpdateListeningLessonRequest {
    @NotNull
    private Long topicId;
    @NotNull
    private Long levelId;
    @NotBlank
    @Size(max = 150)
    private String title;
    private String description;
    private Boolean isPremium;
    private MultipartFile lessonImage;
}