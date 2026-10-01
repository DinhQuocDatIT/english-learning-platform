package com.englishlearning.backend.dto.response;


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
public class LeaderboardEntryResponse {
    private Long studentId;
    private Long userId;
    private String name;
    private String avatar;
    private Integer exp;
    private Integer level;
    private String title;        // "Học giả", "Cao thủ"...
    private String titleEmoji;   // ⭐, 🏆...
    private String levelColor;   // hex color
    private Integer streak;      // display streak (đã check valid)
    private Integer longestStreak;
    private Integer rank;
    private Boolean isCurrentUser;
}