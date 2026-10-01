package com.englishlearning.backend.dto.response;


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
public class LeaderboardResponse {
    private List<LeaderboardEntryResponse> top3;
    private List<LeaderboardEntryResponse> others;   // rank >= 4
    private LeaderboardEntryResponse currentUser;    // entry của user đang login (có thể nằm ngoài top)
    private Integer currentUserRank;
    private Long totalParticipants;
}