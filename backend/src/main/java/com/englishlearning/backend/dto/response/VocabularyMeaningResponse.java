package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class VocabularyMeaningResponse {
    private String partOfSpeech;
    private String meaning;
    private String example;

}