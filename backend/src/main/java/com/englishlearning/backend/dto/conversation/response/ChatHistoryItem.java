package com.englishlearning.backend.dto.conversation.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatHistoryItem {

    private Long id;
    private String level;
    private String levelDisplay;
    private String topic;
    private String status;
    private Integer messageCount;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}