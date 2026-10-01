package com.englishlearning.backend.service;


import com.englishlearning.backend.dto.response.LeaderboardResponse;

public interface LeaderboardService {

    LeaderboardResponse getLeaderboard(Long currentUserId, int limit);
}