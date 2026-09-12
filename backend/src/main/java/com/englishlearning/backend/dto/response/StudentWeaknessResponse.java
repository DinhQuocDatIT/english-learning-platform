package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentWeaknessResponse {

    private String errorKey;
    private String category;
    private String subtype;
    private String categoryDisplayName;
    private String subtypeDescription;
    private String displayName;
    private String suggestion;
    private Integer count;
    private Integer masteryScore;
    private LocalDateTime firstOccurredAt;
    private LocalDateTime lastOccurredAt;
}