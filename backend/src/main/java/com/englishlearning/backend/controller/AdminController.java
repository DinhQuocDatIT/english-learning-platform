package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.RegisterTeacherRequest;
import com.englishlearning.backend.dto.request.UpdateUserProfileRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.dto.response.UserResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admins")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;
    @PostMapping("/teachers")
    public ResponseEntity<ApiResponse<UserResponse>> addTeacher (
            @Valid @RequestBody RegisterTeacherRequest registerTeacherRequest
    ){
        UserResponse response = adminService.addTeacher(registerTeacherRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        201,
                        "Thêm giáo viên thành công",
                        response
                )
        );
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getStudentsList (){
        List<StudentResponse> studentResponses = adminService.getAllStudents();
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách học sinh thành công",
                        studentResponses
                )
        );

    }

//    @GetMapping("/teachers")
//    public ResponseEntity<ApiResponse<List<UserResponse>>> getTeachersList (){
//        List<UserResponse> teacherResponses = adminService.getAllTeachers();
//        return ResponseEntity.status(HttpStatus.OK).body(
//                new ApiResponse<>(
//                        200,
//                        "Lấy danh sách giáo viên thành công",
//                        teacherResponses
//                )
//        );
//    }

    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getTeachersList (

            @RequestParam(defaultValue = "1")int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String keyword

    ){
        PageResponse<UserResponse> teacherResponses = adminService.getAllTeacherByPage(page -1, size,keyword);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách giáo viên thành công",
                        teacherResponses
                )
        );
    }
    @GetMapping("/teachers/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getTeacherById(
            @PathVariable Long id
    ) {
        UserResponse response = adminService.getTeacherById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy thông tin giáo viên thành công",
                        response
                )
        );
    }
    @PutMapping("/teachers/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateTeacher(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {

        UserResponse response =
                adminService.updateTeacher(id, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Cập nhật thông tin giáo viên thành công",
                        response
                )
        );
    }
    @PutMapping("/user/{id}/deactivate")
    public ResponseEntity<ApiResponse<Boolean>> deactivateUser (
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails)
    {
        boolean result = adminService.deactivateUser(customUserDetails.getUser().getId(), id);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Vô hiệu hóa tài khoản thành công",
                        result
                )
        );
    }
    @PutMapping("/user/{id}/activate")
    public ResponseEntity<ApiResponse<Boolean>> activateUser(
            @PathVariable Long id
    ) {
        boolean result = adminService.activateUser(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Mở khóa tài khoản thành công",
                        result
                )
        );
    }
}
