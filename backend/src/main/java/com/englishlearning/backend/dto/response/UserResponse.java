package com.englishlearning.backend.dto.response;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String gender;
    private LocalDate dateOfBirth;
    private String role;
}
