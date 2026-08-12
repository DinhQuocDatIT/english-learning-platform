package com.englishlearning.backend.controller;


import com.englishlearning.backend.dto.request.RegisterStudentRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.dto.response.UserResponse;
import com.englishlearning.backend.service.AdminService;
import com.englishlearning.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {


    @Autowired
    private StudentService studentService;



    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getStudentsList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String keyword
    ) {

        PageResponse<UserResponse> students =
                studentService.getAllStudentByPage(
                        page - 1,
                        size,
                        keyword
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách học sinh thành công",
                        students
                )
        );
    }
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(
            @Valid @RequestBody RegisterStudentRequest request
    ) {

        StudentResponse response =
                studentService.addStudent(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                201,
                                "Thêm học sinh thành công",
                                response
                        )
                );
    }
}
