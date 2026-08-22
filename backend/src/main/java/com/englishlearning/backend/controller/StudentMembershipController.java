package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.StudentMembershipCreateRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.StudentMembershipResponse;
import com.englishlearning.backend.service.StudentMembershipService;
import com.englishlearning.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student-memberships")
public class StudentMembershipController {

    private final StudentMembershipService studentMembershipService;

    public StudentMembershipController(
            StudentMembershipService studentMembershipService
    ) {
        this.studentMembershipService = studentMembershipService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentMembershipResponse>> register(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody StudentMembershipCreateRequest request
    ) {

        StudentMembershipResponse response =
                studentMembershipService.register(
                        userDetails.getUser().getId(),
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Đăng ký gói thành viên thành công",
                        response
                )
        );
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<StudentMembershipResponse>> getCurrentMembership(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        StudentMembershipResponse response =
                studentMembershipService.getCurrentMembership(
                        userDetails.getUser().getId()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        response == null
                                ? "Bạn chưa đăng ký gói thành viên"
                                : "Lấy thông tin gói thành viên thành công",
                        response
                )
        );
    }
}