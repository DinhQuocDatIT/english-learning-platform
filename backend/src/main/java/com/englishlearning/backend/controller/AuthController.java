package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.LoginRequest;
import com.englishlearning.backend.dto.request.RegisterStudentRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.AuthResponse;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.service.AuthService;
import com.englishlearning.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @Autowired
    private StudentService studentService;
    @Autowired
    private AuthService authService;
    @PostMapping("/student-register")
    public ResponseEntity<ApiResponse<StudentResponse>> registerStudent(
            @Valid @RequestBody RegisterStudentRequest request
    ){

        StudentResponse response =
                studentService.addStudent(request);


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                201,
                                "Đăng ký thành công",
                                response
                        )
                );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request){
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity
                .status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Đăng nhập thành công",
                        authResponse
                )
        );
    }
}
