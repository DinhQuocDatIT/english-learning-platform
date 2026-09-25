package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.StreakResponse;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/streaks")
@RequiredArgsConstructor
public class StreakController {

    private final StreakService streakService;
    private final StudentRepository studentRepository;

  
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StreakResponse>> getMyStreak(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Long userId = customUserDetails.getUser().getId();

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy student"));

        StreakResponse response = StreakResponse.builder()
                .currentStreak(streakService.getDisplayStreak(student))
                .longestStreak(streakService.getLongestStreak(student))
                .lastActiveDate(student.getLastActiveDate())
                .build();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy streak thành công",
                        response
                )
        );
    }
}