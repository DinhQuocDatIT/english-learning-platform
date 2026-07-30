package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.constant.RoleConstant;
import com.englishlearning.backend.dto.request.RegisterTeacherRequest;
import com.englishlearning.backend.dto.request.RegisterUserRequest;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.dto.response.UserResponse;
import com.englishlearning.backend.entity.Role;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.exception.DuplicateException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.mapper.StudentMapper;
import com.englishlearning.backend.mapper.UserMapper;
import com.englishlearning.backend.repository.RoleRepository;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.AdminService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private StudentMapper studentMapper;
    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse addTeacher(RegisterTeacherRequest request) {

        if(userRepository.existsByEmail(request.getRegisterUserRequest().getEmail())) {
            throw new DuplicateException("Email đã tồn tại");
        }
        Role role = roleRepository.findByName(RoleConstant.TEACHER)
                .orElseThrow(()->  new ResourceNotFoundException("Teacher role not found"));
        User user = new User();
        RegisterUserRequest registerUserRequest = request.getRegisterUserRequest();
        user.setFullName(registerUserRequest.getFullName());
        user.setPassword(passwordEncoder.encode(registerUserRequest.getPassword()));
        user.setEmail(registerUserRequest.getEmail());
        user.setGender(registerUserRequest.getGender());
        user.setDateOfBirth(registerUserRequest.getDateOfBirth());
        user.setRole(role);
        User userSave =  userRepository.save(user);

        return userMapper.toResponse(userSave);
    }

    @Override
    @Transactional
    public boolean deactivateUser(Long adminId, Long targetUserId) {

        if(adminId.equals(targetUserId)){
            throw new RuntimeException("Không thể vô hiệu hóa chính tài khoản của mình");
        }
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy người dùng"));
        if(user.getDeletedAt() != null){
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
        return true;
    }

    @Override
    public List<UserResponse> getAllTeachers() {
        List<User> teachers = userRepository
                .findByRole_Name(RoleConstant.TEACHER);


        return teachers.stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public List<StudentResponse> getAllStudents() {
        List<User> students = userRepository
                .findByRole_Name(RoleConstant.STUDENT);

        return students
                .stream()
                .map(studentMapper::toResponse)
                .toList();

    }
}
