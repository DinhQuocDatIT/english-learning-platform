package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.TopicCreateRequest;
import com.englishlearning.backend.dto.response.TopicResponse;

import java.util.List;

public interface TopicService {

    // Admin tạo Topic
    TopicResponse create(
            Long adminId,
            TopicCreateRequest request
    );

    // Admin chỉnh sửa Topic
    TopicResponse update(
            Long adminId,
            Long topicId,
            TopicCreateRequest request
    );

    // Admin xem tất cả Topic
    List<TopicResponse> getAll();

    // Admin ẩn Topic
    TopicResponse hide(
            Long adminId,
            Long topicId
    );

    // Admin hiển thị Topic
    TopicResponse publish(
            Long adminId,
            Long topicId
    );

    // =========================
    // TEACHER / STUDENT
    // =========================

    // Lấy các Topic đang hiển thị
    List<TopicResponse> getPublishedTopics();

    // Xem c
    TopicResponse getById(Long topicId);
}