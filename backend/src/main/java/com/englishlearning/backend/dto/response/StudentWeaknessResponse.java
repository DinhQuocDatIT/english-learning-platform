package com.englishlearning.backend.dto.response;

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
public class StudentWeaknessResponse {
    private String weaknessKey;
    private String category;
    private String categoryDisplayName;
    private String displayName;
    private String suggestion;
    private Integer count;
    private Integer masteryScore;
    private LocalDateTime firstOccurredAt;
    private LocalDateTime lastOccurredAt;
}