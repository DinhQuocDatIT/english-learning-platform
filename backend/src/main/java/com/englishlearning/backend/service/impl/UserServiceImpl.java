package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.ChangePasswordRequest;
import com.englishlearning.backend.dto.request.RegisterStudentRequest;
import com.englishlearning.backend.dto.request.UpdateUserProfileRequest;
import com.englishlearning.backend.dto.response.UserResponse;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.mapper.UserMapper;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.FileStorageService;
import com.englishlearning.backend.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public UserResponse getMyProfile(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy người dùng"));

        return userMapper.toResponse(user);
    }


    @Override
    @Transactional
    public UserResponse updateProfile(
            Long id, UpdateUserProfileRequest request
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy người dùng"));


        user.setFullName(request.getFullName());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }



    @Override
    @Transactional
    public boolean changePassword(
            Long id, ChangePasswordRequest request
    ) {


        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        if(!passwordEncoder.matches(request.getOldPassword(), user.getPassword())){
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return true;
    }
    @Override
    @Transactional
    public UserResponse updateAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Vui lòng chọn ảnh");
        }

        // Xóa ảnh cũ (nếu không phải default)
        String oldAvatar = user.getAvatarUrl();
        if (oldAvatar != null && !oldAvatar.equals(User.DEFAULT_AVATAR_URL)) {
            fileStorageService.deleteFile(oldAvatar);
        }

        // Lưu ảnh mới
        String newAvatarUrl = fileStorageService.storeAvatar(file);
        user.setAvatarUrl(newAvatarUrl);
        User saved = userRepository.save(user);

        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse removeAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        // Xóa ảnh cũ
        String oldAvatar = user.getAvatarUrl();
        if (oldAvatar != null && !oldAvatar.equals(User.DEFAULT_AVATAR_URL)) {
            fileStorageService.deleteFile(oldAvatar);
        }

        // Reset về default
        user.setAvatarUrl(User.DEFAULT_AVATAR_URL);
        User saved = userRepository.save(user);

        return userMapper.toResponse(saved);
    }
}
