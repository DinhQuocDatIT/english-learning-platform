package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateStudentRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    private String gender;

    private LocalDate dateOfBirth;

    private Integer experience;

    private Integer totalLearningSeconds;

    private Integer totalCompletedTopic;
}