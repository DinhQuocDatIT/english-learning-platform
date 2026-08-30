package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.ListeningAnswerRequest;
import com.englishlearning.backend.dto.response.ListeningAnswerResponse;

import java.util.List;

public interface ListeningAnswerService {

    ListeningAnswerResponse answerQuestion(
            Long userId,
            ListeningAnswerRequest request
    );

    List<ListeningAnswerResponse> getStudentAnswers(Long userId);
    List<ListeningAnswerResponse> getStudentAnswersByLesson(
            Long userId,
            Long lessonId
    );
    ListeningAnswerResponse getStudentAnswerBySentence(
            Long userId,
            Long sentenceId
    );
    boolean isSentenceCompleted(Long userId, Long sentenceId);
    void resetLessonAnswers(Long userId, Long lessonId);
    boolean isLessonCompleted(Long userId, Long lessonId);
    int getCompletedCountInLesson(Long userId, Long lessonId);
}