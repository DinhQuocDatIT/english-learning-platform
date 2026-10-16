package com.englishlearning.backend.dto.conversation.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SendChatMessageRequest {

    @NotBlank(message = "Tin nhắn không được để trống")
    @Size(max = 2000, message = "Tin nhắn tối đa 2000 ký tự")
    private String message;
}