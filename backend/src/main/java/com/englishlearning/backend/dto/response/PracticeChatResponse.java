package com.englishlearning.backend.dto.response;

import com.englishlearning.backend.enums.PracticeStatus;
import com.englishlearning.backend.enums.SentenceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeChatResponse {
    private Long id;
    private String level;
    private String topic;
    private String sentenceType;
    private Integer questionLimit;
    private Integer questionCount;
    private Integer correctCount;
    private PracticeStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<String> vocabularyWords;
    // Câu hỏi đầu tiên (khi tạo mới)
    private TurnResponse currentTurn;
}