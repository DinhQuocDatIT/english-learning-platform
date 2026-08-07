package com.englishlearning.backend.dto.request;


import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
public class VocabularyRequest {
    private String word;
    private String pronunciation;
    private List<VocabularyMeaningRequest> meanings;

}