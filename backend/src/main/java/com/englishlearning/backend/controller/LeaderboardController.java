package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;

import com.englishlearning.backend.dto.response.LeaderboardResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

  
    @GetMapping
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getLeaderboard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "100") int limit
    ) {
        Long userId = (userDetails != null && userDetails.getUser() != null)
                ? userDetails.getUser().getId()
                : null;

        LeaderboardResponse response = leaderboardService.getLeaderboard(userId, limit);
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Lấy bảng xếp hạng thành công",
                response
        ));
    }
}