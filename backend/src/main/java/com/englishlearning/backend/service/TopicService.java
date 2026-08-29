package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.TopicCreateRequest;
import com.englishlearning.backend.dto.response.TopicResponse;

import java.util.List;

public interface TopicService {

    TopicResponse create(
            Long adminId,
            TopicCreateRequest request
    );

    TopicResponse update(
            Long adminId,
            Long topicId,
            TopicCreateRequest request
    );

    List<TopicResponse> getAll();

    TopicResponse hide(
            Long adminId,
            Long topicId
    );
    TopicResponse publish(
            Long adminId,
            Long topicId
    );


    List<TopicResponse> getPublishedTopics();

    TopicResponse getById(Long topicId);
    List<TopicResponse> getTopicsForStudent(String sortBy);
}