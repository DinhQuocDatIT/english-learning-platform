package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.ListeningSentenceFeedbackRequest;
import com.englishlearning.backend.dto.response.ListeningSentenceFeedbackResponse;

import java.util.List;

public interface ListeningSentenceFeedbackService {


    ListeningSentenceFeedbackResponse create(Long userId, ListeningSentenceFeedbackRequest request);
    ListeningSentenceFeedbackResponse update(Long userId, Long feedbackId, ListeningSentenceFeedbackRequest request);
    void delete(Long userId, Long feedbackId);
    ListeningSentenceFeedbackResponse getByStudentAndSentence(Long userId, Long sentenceId);
    List<ListeningSentenceFeedbackResponse> getMyFeedbacks(Long userId);
    List<ListeningSentenceFeedbackResponse> getBySentence(Long sentenceId);
    List<ListeningSentenceFeedbackResponse> getByLesson(Long lessonId);
    List<ListeningSentenceFeedbackResponse> getMyFeedbacksByLesson(Long userId, Long lessonId);
}