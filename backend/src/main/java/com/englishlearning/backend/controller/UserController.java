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
import org.springframework.web.multipart.MultipartFile;

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
    @PostMapping(value = "/me/avatar", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) {
        UserResponse response = userService.updateAvatar(userDetails.getUser().getId(), file);
        return ResponseEntity.ok(new ApiResponse<>(200, "Cập nhật ảnh đại diện thành công", response));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> removeAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UserResponse response = userService.removeAvatar(userDetails.getUser().getId());
        return ResponseEntity.ok(new ApiResponse<>(200, "Xóa ảnh đại diện thành công", response));
    }
}


