package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.CreatePracticeRequest;
import com.englishlearning.backend.dto.request.SubmitAnswerRequest;
import com.englishlearning.backend.dto.response.EvaluationResponse;
import com.englishlearning.backend.dto.response.PracticeChatResponse;
import com.englishlearning.backend.dto.response.PracticeResultResponse;

import java.util.List;

public interface PracticeService {


    PracticeChatResponse createPractice(Long userId, CreatePracticeRequest request);
    EvaluationResponse submitAnswer(Long userId, SubmitAnswerRequest request);
    List<PracticeChatResponse> getPracticeHistory(Long userId);
    PracticeResultResponse getPracticeResult(Long practiceId, Long userId);
    PracticeChatResponse getPracticeChat(Long practiceId, Long userId);

}