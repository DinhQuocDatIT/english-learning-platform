package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.constant.RoleConstant;
import com.englishlearning.backend.dto.request.RegisterStudentRequest;
import com.englishlearning.backend.dto.request.UpdateStudentRequest;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.dto.response.UserResponse;
import com.englishlearning.backend.entity.Role;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.exception.DuplicateException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.mapper.StudentMapper;
import com.englishlearning.backend.mapper.UserMapper;
import com.englishlearning.backend.repository.RoleRepository;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.StudentService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentMapper studentMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserMapper userMapper;


    @Override
    @Transactional
    public StudentResponse addStudent(RegisterStudentRequest request) {


        if(userRepository.existsByEmail(request.getRegisterUserRequest().getEmail())) {
            throw new DuplicateException( "Email đã tồn tại");
        }
        Role role = roleRepository.findByName(RoleConstant.STUDENT).orElseThrow(() -> new ResourceNotFoundException("Student role not found"));
        User user = new User();
        Student student = new Student();
        user.setFullName(request.getRegisterUserRequest().getFullName());
        user.setPassword(passwordEncoder.encode(request.getRegisterUserRequest().getPassword()));
        user.setEmail(request.getRegisterUserRequest().getEmail());
        user.setGender(request.getRegisterUserRequest().getGender());
        user.setDateOfBirth(request.getRegisterUserRequest().getDateOfBirth());
        user.setRole(role);
        student.setUser(user);
        user.setStudent(student);
        User userSave =  userRepository.save(user);
        return studentMapper.toResponse(userSave);
    }
    @Override
    public PageResponse<UserResponse> getAllStudentByPage(
            int page,
            int size,
            String keyword
    ) {
        if (page < 0) {
            page = 0;
        }

        if (size <= 0) {
            size = 10;
        }

        if (size > 100) {
            size = 100;
        }

        if (keyword == null) {
            keyword = "";
        }

        Pageable pageable = PageRequest.of(page, size);

        Page<User> studentPage = userRepository.searchStudents(
                "STUDENT",
                keyword.trim(),
                pageable
        );

        return PageResponse
                .<UserResponse>builder()
                .content(
                        studentPage.getContent()
                                .stream()
                                .map(userMapper::toResponse)
                                .toList()
                )
                .currentPage(studentPage.getNumber())
                .pageSize(studentPage.getSize())
                .totalElements(studentPage.getTotalElements())
                .totalPages(studentPage.getTotalPages())
                .first(studentPage.isFirst())
                .last(studentPage.isLast())
                .build();
    }
    @Override
    public StudentResponse getStudentByUserId(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy người dùng với id: " + userId
                        )
                );

        if (user.getStudent() == null) {
            throw new ResourceNotFoundException(
                    "Người dùng này không phải học sinh"
            );
        }

        return studentMapper.toResponse(user);
    }
    @Override
    @Transactional
    public StudentResponse updateStudentByUserId(
            Long userId,
            UpdateStudentRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy người dùng với id: " + userId
                        )
                );

        Student student = user.getStudent();

        if (student == null) {
            throw new ResourceNotFoundException(
                    "Người dùng này không phải học sinh"
            );
        }


        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateException("Email đã tồn tại");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());

        if (request.getExperience() != null) {
            student.setExperience(request.getExperience());
        }

        if (request.getTotalLearningSeconds() != null) {
            student.setTotalLearningSeconds(
                    request.getTotalLearningSeconds()
            );
        }

        if (request.getTotalCompletedTopic() != null) {
            student.setTotalCompletedTopic(
                    request.getTotalCompletedTopic()
            );
        }

        User savedUser = userRepository.save(user);

        return studentMapper.toResponse(savedUser);
    }
}
