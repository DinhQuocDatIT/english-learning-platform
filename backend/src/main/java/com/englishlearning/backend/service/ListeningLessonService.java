package com.englishlearning.backend.service;
import com.englishlearning.backend.dto.request.ListeningLessonCreateRequest;
import com.englishlearning.backend.dto.request.UpdateListeningLessonRequest;
import com.englishlearning.backend.dto.response.ListeningLessonResponse;
import com.englishlearning.backend.enums.ListeningLessonStatus;

import java.util.List;

public interface ListeningLessonService {
    ListeningLessonResponse create(
            Long teacherId,
            ListeningLessonCreateRequest request
    );
    ListeningLessonResponse update(
            Long teacherId,
            Long lessonId,
            UpdateListeningLessonRequest request
    );
    List<ListeningLessonResponse> getMyLessons(
            Long teacherId
    );
    List<ListeningLessonResponse> getMyLessonsByTopic(Long teacherId, Long topicId);
    ListeningLessonResponse submitForReview(
            Long teacherId,
            Long lessonId
    );
    ListeningLessonResponse reject(
            Long adminId,
            Long lessonId
    );
    List<ListeningLessonResponse> getAll();
    ListeningLessonResponse approve(
            Long adminId,
            Long lessonId
    );
    ListeningLessonResponse publish(
            Long adminId,
            Long lessonId
    );
    ListeningLessonResponse getById(
            Long lessonId
    );
    List<ListeningLessonResponse> getByTopic(
            Long topicId
    );
    List<ListeningLessonResponse> getPublishedByTopic(
            Long topicId
    );

    void hardDelete(Long teacherId, Long lessonId);
    void softDelete(Long adminId, Long lessonId);
    void restore(Long adminId, Long lessonId);
    List<ListeningLessonResponse> getDeletedLessons();
    List<ListeningLessonResponse> getByTopicForAdmin(Long topicId);
    List<ListeningLessonResponse> getAll(ListeningLessonStatus status);
}
