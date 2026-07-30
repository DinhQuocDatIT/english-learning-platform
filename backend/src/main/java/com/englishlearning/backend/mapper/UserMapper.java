package com.englishlearning.backend.mapper;

import com.englishlearning.backend.dto.response.UserResponse;
import com.englishlearning.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user){

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setGender(user.getGender());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setRole(user.getRole().getName());

        return response;
    }
}
