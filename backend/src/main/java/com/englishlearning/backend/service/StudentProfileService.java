package com.englishlearning.backend.service;


import com.englishlearning.backend.dto.response.StudentProfileResponse;

public interface StudentProfileService {

    StudentProfileResponse getMyProfile(Long userId);
}