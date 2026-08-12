package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.RegisterStudentRequest;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.dto.response.UserResponse;
import org.springframework.stereotype.Service;


public interface StudentService {
    public StudentResponse addStudent(RegisterStudentRequest request);
    PageResponse<UserResponse> getAllStudentByPage(
            int page,
            int size,
            String keyword
    );
}
