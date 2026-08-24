package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class TopicCreateRequest {

    @NotBlank(message = "Tiêu đề topic không được để trống")
    @Size(
            max = 150,
            message = "Tiêu đề không được vượt quá 150 ký tự"
    )
    private String title;

    private String description;

    private MultipartFile topicImage;
}