package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TurnResponse {
    private Long id;
    private Integer questionOrder;
    private String vietnameseSentence;
    private LocalDateTime createdAt;
    @Builder.Default
    private List<String> usedVocabulary = new ArrayList<>();
}