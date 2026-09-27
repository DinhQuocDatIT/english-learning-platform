package com.englishlearning.backend.dto.response.studentprofile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelInfoResponse {

    private Integer level;
    private String title;
    private String titleEmoji;
    private String levelColor;

    private Integer totalXp;
    private Integer currentXpInLevel;
    private Integer xpForNextLevel;
    private Integer xpRemaining;
    private Integer totalXpForNextLevel;
    private Double progressPercent;
}