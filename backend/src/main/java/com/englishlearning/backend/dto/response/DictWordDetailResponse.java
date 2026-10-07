package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DictWordDetailResponse {
    private Long id;
    private String word;
    private String pronunciation;
    private String langCode;
    private List<WordLookupResponse.WordLookupMeaning> meanings;
    private List<String> translations;
}