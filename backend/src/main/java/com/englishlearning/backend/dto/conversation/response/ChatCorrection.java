package com.englishlearning.backend.dto.conversation.response;

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
public class ChatCorrection {

    private Boolean hasError;
    private String userOriginal;
    private String correctedText;
    private List<String> explanations;
    private List<String> grammarNotes;
}