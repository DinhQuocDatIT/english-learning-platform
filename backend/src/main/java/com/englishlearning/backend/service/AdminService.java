package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.RegisterTeacherRequest;
import com.englishlearning.backend.dto.request.RegisterUserRequest;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.dto.response.UserResponse;

import java.util.List;


public interface AdminService  {
    public UserResponse addTeacher(RegisterTeacherRequest request);
    public boolean deactivateUser(Long adminId, Long targetUserId);
    public List<UserResponse> getAllTeachers();
    public List<StudentResponse> getAllStudents();
    public PageResponse<UserResponse> getAllTeacherByPage(int page, int size,String keyword);
}
