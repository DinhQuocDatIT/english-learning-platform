package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.constant.RoleConstant;
import com.englishlearning.backend.dto.request.RegisterStudentRequest;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.entity.Role;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.exception.DuplicateException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.mapper.StudentMapper;
import com.englishlearning.backend.repository.RoleRepository;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.StudentService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
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
}
