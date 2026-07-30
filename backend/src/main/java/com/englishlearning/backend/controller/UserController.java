package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.ChangePasswordRequest;
import com.englishlearning.backend.dto.request.UpdateUserProfileRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.UserResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        UserResponse userResponse = userService.getMyProfile(customUserDetails.getUser().getId());
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Lấy thông tin thành công",
                userResponse
        ));
    }
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
                @AuthenticationPrincipal CustomUserDetails userDetails,
                @RequestBody UpdateUserProfileRequest request){
        UserResponse response = userService.updateProfile(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Cập nhật thông tin thành công",
                response
        ));
        }

    @PutMapping("/me/change-password")
    public ResponseEntity<ApiResponse<Boolean>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ChangePasswordRequest request
    ){

        boolean result = userService.changePassword(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Đổi mật khẩu thành công",
                        result
                )
        );
    }
}


