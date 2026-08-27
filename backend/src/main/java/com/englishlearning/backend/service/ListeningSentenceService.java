package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.ListeningSentenceRequest;
import com.englishlearning.backend.dto.response.ListeningSentenceResponse;

import java.util.List;

public interface ListeningSentenceService {
    ListeningSentenceResponse create(ListeningSentenceRequest request);
    ListeningSentenceResponse update(Long sentenceId, ListeningSentenceRequest request);
    void delete(Long sentenceId);
    ListeningSentenceResponse getById(Long sentenceId);
    List<ListeningSentenceResponse> getByLessonId(Long lessonId);
    List<ListeningSentenceResponse> reorderSentences(Long lessonId, List<Long> sentenceIds);
}