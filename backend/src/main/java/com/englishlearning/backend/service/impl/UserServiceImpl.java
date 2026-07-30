package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.ChangePasswordRequest;
import com.englishlearning.backend.dto.request.RegisterStudentRequest;
import com.englishlearning.backend.dto.request.UpdateUserProfileRequest;
import com.englishlearning.backend.dto.response.UserResponse;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.mapper.UserMapper;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {


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
}
