package com.englishlearning.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListeningAnswerRequest {

    private Long listeningSentenceId;
    private String userText;
}