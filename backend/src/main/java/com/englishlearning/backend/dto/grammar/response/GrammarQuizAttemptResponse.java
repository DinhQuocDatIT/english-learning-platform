package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarQuizAttemptResponse {

    private Long id;
    private Long quizId;
    private String quizTitle;
    private String status;
    private Map<Long, String> answers;
    private Integer correctCount;
    private Integer totalQuestions;
    private Integer score;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private GrammarQuizResponse quiz;
}