package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.studentprofile.LevelInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.MembershipInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.StatsInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.VocabularyInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.WeaknessInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.WeeklyActivityResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/student-profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    /**
     * GET /api/v1/student-profile/me/level
     * Level + XP của student
     */
    @GetMapping("/me/level")
    public ResponseEntity<ApiResponse<LevelInfoResponse>> getLevel(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        LevelInfoResponse response = studentProfileService.getLevel(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy thông tin level thành công", response));
    }

    /**
     * GET /api/v1/student-profile/me/stats
     * Thống kê tổng hợp (XP, ranking, accuracy, sessions...)
     */
    @GetMapping("/me/stats")
    public ResponseEntity<ApiResponse<StatsInfoResponse>> getStats(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        StatsInfoResponse response = studentProfileService.getStats(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy thống kê thành công", response));
    }

    /**
     * GET /api/v1/student-profile/me/membership
     * Gói thành viên + AI usage
     */
    @GetMapping("/me/membership")
    public ResponseEntity<ApiResponse<MembershipInfoResponse>> getMembership(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        MembershipInfoResponse response = studentProfileService.getMembership(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy thông tin gói thành viên thành công", response));
    }

    /**
     * GET /api/v1/student-profile/me/weaknesses
     * Điểm yếu của student (top 5 lỗi hay mắc)
     */
    @GetMapping("/me/weaknesses")
    public ResponseEntity<ApiResponse<List<WeaknessInfoResponse>>> getWeaknesses(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        List<WeaknessInfoResponse> response = studentProfileService.getWeaknesses(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách điểm yếu thành công", response));
    }

    /**
     * GET /api/v1/student-profile/me/vocabulary
     * Thống kê từ vựng (total, learned, learning...)
     */
    @GetMapping("/me/vocabulary")
    public ResponseEntity<ApiResponse<VocabularyInfoResponse>> getVocabulary(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        VocabularyInfoResponse response = studentProfileService.getVocabulary(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy thống kê từ vựng thành công", response));
    }

    /**
     * GET /api/v1/student-profile/me/weekly-activity
     * Hoạt động 7 ngày (số câu AI Practice theo ngày)
     */
    @GetMapping("/me/weekly-activity")
    public ResponseEntity<ApiResponse<List<WeeklyActivityResponse>>> getWeeklyActivity(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        List<WeeklyActivityResponse> response = studentProfileService.getWeeklyActivity(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy hoạt động 7 ngày thành công", response));
    }
}