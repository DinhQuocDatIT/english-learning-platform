package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.studentprofile.LevelInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.MembershipInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.StatsInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.VocabularyInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.WeaknessInfoResponse;
import com.englishlearning.backend.dto.response.studentprofile.WeeklyActivityResponse;
import com.englishlearning.backend.entity.*;
import com.englishlearning.backend.enums.LearningStatus;
import com.englishlearning.backend.enums.StudentMembershipStatus;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.*;
import com.englishlearning.backend.service.StudentProfileService;
import com.englishlearning.backend.util.LevelCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentRepository studentRepository;
    private final StudentStatisticsRepository statsRepository;
    private final StudentMembershipRepository studentMembershipRepository;
    private final AIRequestDailyLogRepository aiRequestDailyLogRepository;
    private final StudentAIErrorRepository studentAIErrorRepository;
    private final AIErrorRepository aiErrorRepository;
    private final StudentVocabularyRepository studentVocabularyRepository;

    private static final int MAX_WEAKNESSES = 5;
    private static final int MAX_RECENT_WORDS = 5;
    private static final int WEEKLY_DAYS = 7;

    // =====================================================
    // 1. LEVEL
    // =====================================================
    @Override
    public LevelInfoResponse getLevel(Long userId) {
        Student student = getStudentByUserId(userId);
        int totalXp = student.getExperience() != null ? student.getExperience() : 0;

        int level = LevelCalculator.getLevelFromXp(totalXp);
        String title = LevelCalculator.getTitleForLevel(level);
        String emoji = LevelCalculator.getTitleEmoji(level);
        String color = LevelCalculator.getLevelColor(level);

        int currentXpInLevel = LevelCalculator.getCurrentXpInLevel(totalXp);
        int xpForNext = LevelCalculator.getLevelRange(level);
        int xpRemaining = LevelCalculator.getXpRemaining(totalXp);
        int totalXpForNext = LevelCalculator.getTotalXpForNextLevel(totalXp);
        double progress = LevelCalculator.getProgressPercent(totalXp);

        return LevelInfoResponse.builder()
                .level(level)
                .title(title)
                .titleEmoji(emoji)
                .levelColor(color)
                .totalXp(totalXp)
                .currentXpInLevel(currentXpInLevel)
                .xpForNextLevel(xpForNext)
                .xpRemaining(xpRemaining)
                .totalXpForNextLevel(totalXpForNext)
                .progressPercent(Math.round(progress * 10.0) / 10.0)
                .build();
    }

    // =====================================================
    // 2. STATS
    // =====================================================
    @Override
    public StatsInfoResponse getStats(Long userId) {
        Student student = getStudentByUserId(userId);
        Long studentId = student.getId();

        // XP + topics
        int totalXp = student.getExperience() != null ? student.getExperience() : 0;
        int totalCompletedTopics = student.getTotalCompletedTopic() != null
                ? student.getTotalCompletedTopic() : 0;
        int totalLearningSeconds = student.getTotalLearningSeconds() != null
                ? student.getTotalLearningSeconds() : 0;

        // Ranking — dùng statsRepository (có tie-break)
        long totalStudents = statsRepository.countAllStudents();
        Integer ranking = null;
        Double topPercent = null;
        if (totalStudents > 0) {
            long higher = statsRepository.countHigherXp(totalXp);
            long sameLowerId = statsRepository.countSameXpLowerId(totalXp, studentId);
            ranking = (int) (higher + sameLowerId + 1);
            topPercent = round1(((higher + 1.0) / totalStudents) * 100.0);
        }

        // Practice stats
        long totalSessions = statsRepository.countCompletedSessions(studentId)
                + statsRepository.countInProgressSessions(studentId);
        long completedSessions = statsRepository.countCompletedSessions(studentId);
        long inProgressSessions = statsRepository.countInProgressSessions(studentId);

        long totalAiAnswers = statsRepository.sumTotalQuestions(studentId);
        long totalAiCorrect = statsRepository.sumTotalCorrect(studentId);
        Double avgAiScore = statsRepository.getAverageScore(studentId);

        // Listening stats
        long totalListening = statsRepository.countListeningAnswers(studentId);
        long totalListeningCorrect = statsRepository.countListeningCorrect(studentId);

        // Accuracy — tổng hợp AI + Listening
        long totalAll = totalAiAnswers + totalListening;
        long totalCorrectAll = totalAiCorrect + totalListeningCorrect;
        double accuracy = totalAll > 0 ? (totalCorrectAll * 100.0) / totalAll : 0.0;

        return StatsInfoResponse.builder()
                .totalXp(totalXp)
                .totalCompletedTopics(totalCompletedTopics)
                .totalLearningSeconds(totalLearningSeconds)
                .accuracyRate(round1(accuracy))
                .ranking(ranking)
                .topPercent(topPercent)
                .totalStudents(totalStudents)
                .totalListeningAnswers(totalListening)
                .totalListeningCorrect(totalListeningCorrect)
                .totalAiAnswers(totalAiAnswers)
                .totalAiCorrect(totalAiCorrect)
                .avgAiScore(avgAiScore != null ? round1(avgAiScore) : 0.0)
                .totalSessions(totalSessions)
                .completedSessions(completedSessions)
                .inProgressSessions(inProgressSessions)
                .build();
    }

    // =====================================================
    // 3. MEMBERSHIP
    // =====================================================
    @Override
    public MembershipInfoResponse getMembership(Long userId) {
        Student student = getStudentByUserId(userId);
        Long studentId = student.getId();

        Optional<StudentMembership> opt = studentMembershipRepository
                .findFirstByStudentIdAndStatusOrderByEndDateDesc(
                        studentId, StudentMembershipStatus.ACTIVE
                );

        LocalDate today = LocalDate.now();

        if (opt.isEmpty() || opt.get().getEndDate().isBefore(today)) {
            return MembershipInfoResponse.builder()
                    .hasMembership(false)
                    .aiUsage(buildAiUsageInfo(0, null, false))
                    .build();
        }

        StudentMembership membership = opt.get();
        MembershipPackage pkg = membership.getMembershipPackage();
        long remainingDays = ChronoUnit.DAYS.between(today, membership.getEndDate());

        int limit = pkg.getDailyAiRequestLimit() != null ? pkg.getDailyAiRequestLimit() : 0;
        int used = aiRequestDailyLogRepository
                .findByStudentIdAndRequestDate(studentId, today)
                .map(AIRequestDailyLog::getRequestCount)
                .orElse(0);
        boolean canMake = (limit == 0) || (used < limit);

        return MembershipInfoResponse.builder()
                .hasMembership(true)
                .packageName(pkg.getName())
                .startDate(membership.getStartDate())
                .endDate(membership.getEndDate())
                .remainingDays(remainingDays)
                .aiUsage(buildAiUsageInfo(used, limit, canMake))
                .build();
    }

    private MembershipInfoResponse.AiUsageInfo buildAiUsageInfo(int used, Integer limit, boolean canMake) {
        int limitValue = limit != null ? limit : 0;
        int remaining = limitValue > 0 ? Math.max(0, limitValue - used) : 0;
        double percent = limitValue > 0 ? (used * 100.0) / limitValue : 0.0;

        return MembershipInfoResponse.AiUsageInfo.builder()
                .limit(limitValue)
                .used(used)
                .remaining(remaining)
                .percent(round1(percent))
                .canMakeRequest(canMake)
                .build();
    }

    // =====================================================
    // 4. WEAKNESSES
    // =====================================================
    @Override
    public List<WeaknessInfoResponse> getWeaknesses(Long userId) {
        Student student = getStudentByUserId(userId);
        Long studentId = student.getId();

        List<StudentAIError> errors = studentAIErrorRepository
                .findTop5ByStudentIdOrderByMasteryScoreAsc(studentId);

        if (errors.isEmpty()) return new ArrayList<>();

        return errors.stream()
                .limit(MAX_WEAKNESSES)
                .map(e -> {
                    AIError latest = findLatestErrorByType(studentId, e.getErrorType());

                    return WeaknessInfoResponse.builder()
                            .errorType(e.getErrorType())
                            .errorCategory(e.getErrorCategory())
                            .displayName(e.getErrorType() != null ? e.getErrorType() : "Lỗi không xác định")
                            .occurrenceCount(e.getOccurrenceCount())
                            .correctedCount(e.getCorrectedCount())
                            .masteryScore(e.getMasteryScore())
                            .level(getWeaknessLevel(e.getMasteryScore()))
                            .suggestion(e.getErrorType())
                            .exampleWrong(latest != null ? latest.getUserText() : null)
                            .exampleCorrect(latest != null ? latest.getCorrectText() : null)
                            .explanation(latest != null ? latest.getExplanation() : null)
                            .firstOccurredAt(e.getFirstOccurredAt())
                            .lastOccurredAt(e.getLastOccurredAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private AIError findLatestErrorByType(Long studentId, String errorType) {
        try {
            List<AIError> errors = aiErrorRepository
                    .findLatestByStudentIdAndErrorType(studentId, errorType);
            return errors.isEmpty() ? null : errors.get(0);
        } catch (Exception ex) {
            log.warn("Không tìm thấy ví dụ lỗi: {}", ex.getMessage());
            return null;
        }
    }

    private String getWeaknessLevel(int masteryScore) {
        if (masteryScore < 30) return "Yếu";
        if (masteryScore < 60) return "Trung bình";
        return "Khá";
    }

    // =====================================================
    // 5. VOCABULARY
    // =====================================================
    @Override
    public VocabularyInfoResponse getVocabulary(Long userId) {
        Student student = getStudentByUserId(userId);
        Long studentId = student.getId();

        List<StudentVocabulary> all = studentVocabularyRepository.findByStudentId(studentId);

        long total = all.size();
        long learned = all.stream()
                .filter(v -> v.getLearningStatus() == LearningStatus.LEARNED)
                .count();
        long learning = all.stream()
                .filter(v -> v.getLearningStatus() == LearningStatus.LEARNING)
                .count();
        long notLearned = total - learned - learning;

        double learnedPercent = total > 0 ? (learned * 100.0) / total : 0.0;

        List<String> recentWords = all.stream()
                .sorted(Comparator.comparing(
                        StudentVocabulary::getSavedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(MAX_RECENT_WORDS)
                .map(v -> v.getVocabulary() != null ? v.getVocabulary().getWord() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return VocabularyInfoResponse.builder()
                .total(total)
                .learned(learned)
                .learning(learning)
                .notLearned(notLearned)
                .learnedPercent(round1(learnedPercent))
                .recentWords(recentWords)
                .build();
    }

    // =====================================================
    // 6. WEEKLY ACTIVITY (chỉ AI Practice)
    // =====================================================
    @Override
    public List<WeeklyActivityResponse> getWeeklyActivity(Long userId) {
        Student student = getStudentByUserId(userId);
        Long studentId = student.getId();

        LocalDateTime from = LocalDate.now()
                .minusDays(WEEKLY_DAYS - 1)
                .atStartOfDay();

        List<Object[]> rows = statsRepository.countQuestionsByDate(studentId, from);

        Map<LocalDate, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = toLocalDate(row[0]);
            long count = ((Number) row[1]).longValue();
            if (date != null) map.put(date, count);
        }

        List<WeeklyActivityResponse> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = WEEKLY_DAYS - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            result.add(WeeklyActivityResponse.builder()
                    .date(d)
                    .questionCount(map.getOrDefault(d, 0L))
                    .build());
        }
        return result;
    }

    // =====================================================
    // HELPERS
    // =====================================================
    private Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông tin học viên"
                ));
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private LocalDate toLocalDate(Object obj) {
        if (obj == null) return null;
        if (obj instanceof java.sql.Date d) return d.toLocalDate();
        if (obj instanceof LocalDate ld) return ld;
        if (obj instanceof java.util.Date d) {
            return d.toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate();
        }
        try {
            return LocalDate.parse(obj.toString());
        } catch (Exception e) {
            return null;
        }
    }
}