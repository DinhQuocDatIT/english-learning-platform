package com.englishlearning.backend.dto.response.studentprofile;

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
public class WeaknessInfoResponse {

    private String errorType;
    private String errorCategory;
    private String displayName;

    private Integer occurrenceCount;
    private Integer correctedCount;
    private Integer masteryScore;
    private String level;

    private String suggestion;

    private String exampleWrong;
    private String exampleCorrect;
    private String explanation;

    private LocalDateTime firstOccurredAt;
    private LocalDateTime lastOccurredAt;
}