package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.LeaderboardEntryResponse;
import com.englishlearning.backend.dto.response.LeaderboardResponse;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.service.LeaderboardService;
import com.englishlearning.backend.service.StreakService;
import com.englishlearning.backend.util.LevelCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final StudentRepository studentRepository;
    private final StreakService streakService;

    @Override
    @Transactional(readOnly = true)
    public LeaderboardResponse getLeaderboard(Long currentUserId, int limit) {
        if (limit <= 0) limit = 100;
        if (limit > 500) limit = 500;

        // 1. Lấy danh sách student đã sort theo exp (tie-break bằng id ASC)
        List<Student> students = studentRepository.findTopStudents(
                PageRequest.of(0, limit)
        );

        long totalParticipants = studentRepository.countActiveStudents();

        // 2. Map sang DTO
        List<LeaderboardEntryResponse> entries = new ArrayList<>();
        int rank = 1;
        LeaderboardEntryResponse currentUserEntry = null;

        for (Student s : students) {
            LeaderboardEntryResponse entry = mapToEntry(s, rank, currentUserId);
            entries.add(entry);
            if (Boolean.TRUE.equals(entry.getIsCurrentUser())) {
                currentUserEntry = entry;
            }
            rank++;
        }

        // 3. Nếu user đang login không nằm trong top limit → tìm riêng
        Integer currentUserRank = null;
        if (currentUserEntry != null) {
            currentUserRank = currentUserEntry.getRank();
        } else if (currentUserId != null) {
            Student me = studentRepository.findByUserId(currentUserId).orElse(null);
            if (me != null) {
                int myExp = me.getExperience() != null ? me.getExperience() : 0;

                long higher = studentRepository.countStudentsWithHigherXp(myExp);
                long sameButLowerId = studentRepository.countStudentsWithSameXpButLowerId(
                        myExp, me.getId()
                );

                int myRank = (int) (higher + sameButLowerId) + 1;

                currentUserEntry = mapToEntry(me, myRank, currentUserId);
                currentUserRank = myRank;
            }
        }

        // 4. Tách top3 và others
        List<LeaderboardEntryResponse> top3 = entries.stream()
                .limit(3)
                .toList();
        List<LeaderboardEntryResponse> others = entries.stream()
                .skip(3)
                .toList();

        return LeaderboardResponse.builder()
                .top3(top3)
                .others(others)
                .currentUser(currentUserEntry)
                .currentUserRank(currentUserRank)
                .totalParticipants(totalParticipants)
                .build();
    }

    private LeaderboardEntryResponse mapToEntry(Student s, int rank, Long currentUserId) {
        var user = s.getUser();
        int exp = s.getExperience() != null ? s.getExperience() : 0;
        int level = LevelCalculator.getLevelFromXp(exp);
        int displayStreak = streakService.getDisplayStreak(s);

        boolean isCurrent = currentUserId != null
                && user != null
                && currentUserId.equals(user.getId());

        return LeaderboardEntryResponse.builder()
                .studentId(s.getId())
                .userId(user != null ? user.getId() : null)
                .name(user != null ? user.getFullName() : "Ẩn danh")
                .avatar(user != null ? user.getAvatarUrl() : null)
                .exp(exp)
                .level(level)
                .title(LevelCalculator.getTitleForLevel(level))
                .titleEmoji(LevelCalculator.getTitleEmoji(level))
                .levelColor(LevelCalculator.getLevelColor(level))
                .streak(displayStreak)
                .longestStreak(streakService.getLongestStreak(s))
                .rank(rank)
                .isCurrentUser(isCurrent)
                .build();
    }
}