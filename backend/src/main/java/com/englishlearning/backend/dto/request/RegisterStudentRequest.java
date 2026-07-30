package com.englishlearning.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterStudentRequest {
  @Valid
  @NotNull(message = "Thông tin người dùng không được để trống")
  RegisterUserRequest registerUserRequest;
}
