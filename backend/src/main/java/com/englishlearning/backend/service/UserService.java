package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.ChangePasswordRequest;
import com.englishlearning.backend.dto.request.UpdateUserProfileRequest;
import com.englishlearning.backend.dto.response.UserResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


public interface UserService {
    public UserResponse getMyProfile (Long id);
    public UserResponse updateProfile (Long id , UpdateUserProfileRequest updateUserProfileRequest);
    public boolean changePassword(Long id, ChangePasswordRequest changePasswordRequest);
    UserResponse updateAvatar(Long userId, MultipartFile file);
    UserResponse removeAvatar(Long userId);
}