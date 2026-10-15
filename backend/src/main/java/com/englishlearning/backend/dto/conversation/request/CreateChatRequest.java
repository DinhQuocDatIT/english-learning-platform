package com.englishlearning.backend.dto.conversation.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatRequest {

    @NotBlank(message = "Level không được để trống")
    private String level; // BEGINNER, INTERMEDIATE, ADVANCED
}