package com.englishlearning.backend.dto.response.studentprofile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyInfoResponse {

    private Long total;
    private Long learned;
    private Long learning;
    private Long notLearned;

    private Double learnedPercent;

    private List<String> recentWords;
}