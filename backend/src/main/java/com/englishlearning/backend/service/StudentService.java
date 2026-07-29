package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.RegisterStudentRequest;
import com.englishlearning.backend.dto.response.StudentResponse;
import org.springframework.stereotype.Service;


public interface StudentService {
    public StudentResponse addStudent(RegisterStudentRequest request);
}
