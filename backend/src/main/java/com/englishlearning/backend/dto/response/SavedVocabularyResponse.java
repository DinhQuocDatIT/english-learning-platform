package com.englishlearning.backend.dto.response;

import com.englishlearning.backend.enums.LearningStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SavedVocabularyResponse {
    private Long id;
    private String word;
    private String pronunciation;
    private LearningStatus learningStatus;
    private LocalDateTime savedAt;
    private List<VocabularyMeaningResponse> meanings;
}