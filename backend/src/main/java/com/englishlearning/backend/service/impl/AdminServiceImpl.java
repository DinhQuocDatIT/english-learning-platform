package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.constant.RoleConstant;
import com.englishlearning.backend.dto.request.RegisterTeacherRequest;
import com.englishlearning.backend.dto.request.RegisterUserRequest;
import com.englishlearning.backend.dto.request.UpdateUserProfileRequest;
import com.englishlearning.backend.dto.response.PageResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
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
    @Autowired
    private PathPatternRequestMatcher.Builder builder;

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

    @Override
    public PageResponse<UserResponse> getAllTeacherByPage(int page, int size,String keyword) {
        if(page<0){
            page = 0;
        }
        if(size<=0){
            size = 10;
        }
        if(size >100){
            size = 100;
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<User > users = userRepository.searchTeachers(
                "TEACHER",
                keyword.trim(),
                pageable
        );
        return PageResponse.<UserResponse>builder()
                .content(
                users
                        .getContent()
                        .stream()
                        .map(userMapper::toResponse)
                        .toList()
        )
                .currentPage(users.getNumber())
                .pageSize(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .first(users.isFirst())
                .last(users.isLast())
                .build();

    }
    public UserResponse getTeacherById(Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên"));


        return userMapper.toResponse(teacher);
    }
    @Override
    @Transactional
    public UserResponse updateTeacher(
            Long id,
            UpdateUserProfileRequest request
    ) {

        User teacher = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy giáo viên"));
        if (!RoleConstant.TEACHER.equals(teacher.getRole().getName())) {
            throw new RuntimeException("Người dùng này không phải giáo viên");
        }


        if (!teacher.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateException("Email đã tồn tại");
        }

        teacher.setFullName(request.getFullName().trim());
        teacher.setEmail(request.getEmail().trim());
        teacher.setGender(request.getGender());
        teacher.setDateOfBirth(request.getDateOfBirth());

        User savedTeacher = userRepository.save(teacher);

        return userMapper.toResponse(savedTeacher);
    }
    @Transactional
    @Override
    public boolean activateUser(Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (user.getDeletedAt() == null) {
            throw new RuntimeException("Tài khoản đang hoạt động");
        }

        user.setDeletedAt(null);
        userRepository.save(user);

        return true;
    }
}
