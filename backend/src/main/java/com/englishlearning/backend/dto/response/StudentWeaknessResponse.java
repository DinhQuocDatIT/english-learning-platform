package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentWeaknessResponse {
    private String errorType;
    private String displayName;
    private Integer count;
    private Integer masteryScore;
    private String suggestion;
}
