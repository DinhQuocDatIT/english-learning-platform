package com.englishlearning.backend.dto.request;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class VocabularyMeaningRequest {


    private String partOfSpeech;


    private String meaning;


    private String example;

}