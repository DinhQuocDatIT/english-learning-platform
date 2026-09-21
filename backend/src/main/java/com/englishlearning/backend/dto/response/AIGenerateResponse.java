package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIGenerateResponse {

    private String vietnameseSentence;
    private String expectedAnswer;
    private String sentenceType; // QUESTION or ANSWER
    @Builder.Default
    private List<String> usedVocabulary = new ArrayList<>();
}