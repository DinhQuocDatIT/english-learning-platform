package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarQuizQuestionResponse {

    private Long id;
    private String question;
    private List<String> options;
    private Integer displayOrder;

    // Chỉ trả về khi IN_PROGRESS = null (không lộ đáp án)
    // Chỉ trả về khi COMPLETED hoặc cho TEACHER/ADMIN
    private String correctAnswer;
    private String explanation;
    private Map<String, String> optionExplanations;
}