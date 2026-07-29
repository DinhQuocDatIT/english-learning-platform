package com.englishlearning.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterUserRequest {
    private String fullName;

    private String email;

    private String password;

    private String gender;

    private LocalDate dateOfBirth;
}
