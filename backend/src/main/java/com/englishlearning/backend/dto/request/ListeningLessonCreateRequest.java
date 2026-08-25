package com.englishlearning.backend.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
@Getter
@Setter
public class ListeningLessonCreateRequest {

    @NotNull(message = "Topic không được để trống")
    private Long topicId;

    @NotNull(message = "Level không được để trống")
    private Long levelId;

    @NotBlank(message = "Tiêu đề bài nghe không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;

    private String description;

    private Boolean isPremium = false;

    private MultipartFile lessonImage;
}