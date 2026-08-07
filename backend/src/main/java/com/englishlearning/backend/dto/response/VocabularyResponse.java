package com.englishlearning.backend.dto.response;
import lombok.Builder;
import lombok.Getter;

import java.util.List;


@Getter
@Builder
public class VocabularyResponse {


    private Long id;


    private String word;


    private String pronunciation;


    private List<VocabularyMeaningResponse> meanings;

}