package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LevelUpdateRequest {

    @NotBlank(message = "Tên level không được để trống")
    @Size(max = 50, message = "Tên level không được vượt quá 50 ký tự")
    private String name;
    private String description;
    @Pattern(
            regexp = "^#[0-9A-Fa-f]{6}$",
            message = "Màu level phải có định dạng HEX, ví dụ: #22C55E"
    )
    private String color;
}