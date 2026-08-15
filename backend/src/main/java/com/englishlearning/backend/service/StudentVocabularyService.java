package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.SaveVocabularyRequest;
import com.englishlearning.backend.dto.response.SavedVocabularyResponse;
import com.englishlearning.backend.enums.LearningStatus;

import java.util.List;

public interface StudentVocabularyService {

    SavedVocabularyResponse saveVocabulary(
            Long userId,
            SaveVocabularyRequest request
    );

    List<SavedVocabularyResponse> getAll(
            Long userId
    );

    List<SavedVocabularyResponse> getByStatus(
            Long userId,
            LearningStatus status
    );

    SavedVocabularyResponse updateStatus(
            Long userId,
            Long studentVocabularyId,
            LearningStatus status
    );
}
