package com.englishlearning.backend.dto.request;

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
public class UpdateUserProfileRequest {
    @NotBlank(message = "Họ tên không được để trống")
    @Size(
            min = 1,
            max = 50,
            message = "Họ tên phải từ 1 đến 50 ký tự"
    )
    private String fullName;


    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;


    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(
            min = 6,
            max = 100,
            message = "Mật khẩu phải có ít nhất 6 ký tự"
    )
    private String password;


    @NotBlank(message = "Giới tính không được để trống")
    private String gender;


    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải nhỏ hơn ngày hiện tại")
    private LocalDate dateOfBirth;
}
