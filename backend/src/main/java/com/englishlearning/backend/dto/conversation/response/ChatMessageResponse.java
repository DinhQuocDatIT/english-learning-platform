package com.englishlearning.backend.dto.conversation.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

    private Long id;
    private String role;
    private String content;
    private String replyTranslation;
    private String nextQuestion;
    private String nextQuestionTranslation;
    private List<String> suggestedAnswers;
    private ChatCorrection correction;
    private LocalDateTime createdAt;
}