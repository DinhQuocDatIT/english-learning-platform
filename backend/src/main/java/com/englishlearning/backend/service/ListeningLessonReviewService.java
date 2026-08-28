package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.ListeningLessonReviewRequest;
import com.englishlearning.backend.dto.response.ListeningLessonReviewResponse;

import java.util.List;

public interface ListeningLessonReviewService {

    ListeningLessonReviewResponse create(ListeningLessonReviewRequest request);

    ListeningLessonReviewResponse getById(Long reviewId);

    List<ListeningLessonReviewResponse> getByLessonId(Long lessonId);

    List<ListeningLessonReviewResponse> getAll();

    void delete(Long reviewId);
}