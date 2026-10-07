package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class WordLookupResponse {

    private String word;
    private String pronunciation;
    private List<WordLookupMeaning> meanings;

    @Getter
    @Builder
    public static class WordLookupMeaning {
        private String partOfSpeech;
        private String meaning;
        private String example;
    }
}