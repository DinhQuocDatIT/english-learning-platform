package com.englishlearning.backend.mapper;

import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.entity.User;
import org.springframework.stereotype.Component;


@Component
public class StudentMapper {


    public StudentResponse toResponse(User user){

        StudentResponse response = new StudentResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setGender(user.getGender());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setRole(user.getRole().getName());
        response.setCreatedAt(user.getCreatedAt());
        if(user.getStudent() != null){
            response.setExperience(user.getStudent().getExperience());
            response.setTotalLearningSeconds(user.getStudent().getTotalLearningSeconds());
            response.setTotalCompletedTopic(user.getStudent().getTotalCompletedTopic());
        }


        return response;
    }
}