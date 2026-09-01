package com.englishlearning.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIEvaluateRequest {

    private String vietnameseSentence;
    private String expectedAnswer;
    private String studentAnswer;
    private String level;
    private String topic;
    private List<String> vocabularyWords;
    private List<String> weaknesses;
}