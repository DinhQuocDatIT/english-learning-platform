package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.response.studentprofile.LevelInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.MembershipInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.StatsInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.VocabularyInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.WeaknessInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.WeeklyActivityResponse;

import java.util.List;

public interface StudentProfileService {

    LevelInfoResponse getLevel(Long userId);

    StatsInfoResponse getStats(Long userId);

    MembershipInfoResponse getMembership(Long userId);

    List<WeaknessInfoResponse> getWeaknesses(Long userId);

    VocabularyInfoResponse getVocabulary(Long userId);

    List<WeeklyActivityResponse> getWeeklyActivity(Long userId);
}