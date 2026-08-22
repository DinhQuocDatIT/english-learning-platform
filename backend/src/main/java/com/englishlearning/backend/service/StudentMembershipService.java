package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.StudentMembershipCreateRequest;
import com.englishlearning.backend.dto.response.StudentMembershipResponse;

public interface StudentMembershipService {

    StudentMembershipResponse register(
            Long userId,
            StudentMembershipCreateRequest request
    );

    StudentMembershipResponse getCurrentMembership(
            Long userId
    );
}