package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.StudentStatisticsResponse;
import com.englishlearning.backend.dto.response.StudentStatisticsResponse.*;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.repository.StudentStatisticsRepository;
import com.englishlearning.backend.service.StudentStatisticsService;
import com.englishlearning.backend.util.ErrorTypeHelper;
import com.englishlearning.backend.util.LevelCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentStatisticsServiceImpl implements StudentStatisticsService {

    private final StudentRepository studentRepository;
    private final StudentStatisticsRepository statsRepository;

    private static final int WEEKLY_DAYS = 7;

    // =====================================================
    // PUBLIC API
    // =====================================================

    @Override
    public StudentStatisticsResponse getStatistics(Long userId) {
        log.info("Getting full statistics for userId: {}", userId);

        Student student = findStudent(userId);
        Long studentId = student.getId();

        return StudentStatisticsResponse.builder()
                .studentId(studentId)
                .fullName(student.getUser().getFullName())
                .overview(buildOverview(student, studentId))
                .levelRanking(buildLevelRanking(student, studentId))
                .practice(buildPracticeStats(studentId))
                .listening(buildListeningStats(studentId))
                .vocabulary(buildVocabularyStats(studentId))
                .topErrors(buildTopErrors(studentId))
                .weeklyActivity(buildWeeklyActivity(studentId))
                .aiUsage(buildAIUsageStats(studentId))
                .build();
    }

    @Override
    public StudentStatisticsResponse getQuickStats(Long userId) {
        log.info("Getting quick statistics for userId: {}", userId);

        Student student = findStudent(userId);
        Long studentId = student.getId();

        return StudentStatisticsResponse.builder()
                .studentId(studentId)
                .fullName(student.getUser().getFullName())
                .overview(buildOverview(student, studentId))
                .levelRanking(buildLevelRanking(student, studentId))
                .build();
    }

    // =====================================================
    // PRIVATE BUILDERS
    // =====================================================

    private Student findStudent(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông tin học viên"
                ));
    }

    // ===== 1. OVERVIEW =====
    private Overview buildOverview(Student student, Long studentId) {
        long totalQuestions = statsRepository.sumTotalQuestions(studentId);
        long totalCorrect = statsRepository.sumTotalCorrect(studentId);

        long listeningTotal = statsRepository.countListeningAnswers(studentId);
        long listeningCorrect = statsRepository.countListeningCorrect(studentId);

        long totalAnswers = totalQuestions + listeningTotal;
        long totalCorrectAll = totalCorrect + listeningCorrect;

        double overallAccuracy = totalAnswers > 0
                ? (totalCorrectAll * 100.0) / totalAnswers
                : 0.0;

        long completed = statsRepository.countCompletedSessions(studentId);
        long inProgress = statsRepository.countInProgressSessions(studentId);
        int totalActivities = (int) (completed + inProgress + listeningTotal);

        return Overview.builder()
                .totalXp(safeInt(student.getExperience()))
                .totalCompletedTopics(safeInt(student.getTotalCompletedTopic()))
                .totalLearningSeconds(safeInt(student.getTotalLearningSeconds()))
                .overallAccuracy(round1(overallAccuracy))
                .totalActivities(totalActivities)
                .build();
    }

    // ===== 2. LEVEL & RANKING =====
    private LevelRanking buildLevelRanking(Student student, Long studentId) {
        int xp = safeInt(student.getExperience());

        int level = LevelCalculator.getLevelFromXp(xp);
        String title = LevelCalculator.getTitleForLevel(level);
        String emoji = LevelCalculator.getTitleEmoji(level);
        String color = LevelCalculator.getLevelColor(level);

        double progress = LevelCalculator.getProgressPercent(xp);
        int xpRemaining = LevelCalculator.getXpRemaining(xp);

        Integer ranking = null;
        Double topPercent = null;
        long totalStudents = statsRepository.countAllStudents();

        if (totalStudents > 0) {
            long higher = statsRepository.countHigherXp(xp);
            long sameLowerId = statsRepository.countSameXpLowerId(xp, studentId);
            ranking = (int) (higher + sameLowerId + 1);
            topPercent = round1(((higher + 1.0) / totalStudents) * 100.0);
        }

        return LevelRanking.builder()
                .level(level)
                .title(title)
                .titleEmoji(emoji)
                .levelColor(color)
                .progressPercent(round1(progress))
                .xpRemaining(xpRemaining)
                .ranking(ranking)
                .topPercent(topPercent)
                .totalStudents(totalStudents)
                .build();
    }

    // ===== 3. PRACTICE =====
    private PracticeStats buildPracticeStats(Long studentId) {
        long completed = statsRepository.countCompletedSessions(studentId);
        long inProgress = statsRepository.countInProgressSessions(studentId);
        long totalQuestions = statsRepository.sumTotalQuestions(studentId);
        long totalCorrect = statsRepository.sumTotalCorrect(studentId);

        double accuracy = totalQuestions > 0
                ? (totalCorrect * 100.0) / totalQuestions
                : 0.0;

        Double avgScore = statsRepository.getAverageScore(studentId);

        return PracticeStats.builder()
                .totalSessions(completed + inProgress)
                .completedSessions(completed)
                .inProgressSessions(inProgress)
                .totalQuestions(totalQuestions)
                .totalCorrect(totalCorrect)
                .accuracyRate(round1(accuracy))
                .averageScore(avgScore != null ? round1(avgScore) : 0.0)
                .build();
    }

    // ===== 4. LISTENING =====
    private ListeningStats buildListeningStats(Long studentId) {
        long total = statsRepository.countListeningAnswers(studentId);
        long correct = statsRepository.countListeningCorrect(studentId);

        double accuracy = total > 0 ? (correct * 100.0) / total : 0.0;

        return ListeningStats.builder()
                .totalAnswers(total)
                .correctAnswers(correct)
                .accuracyRate(round1(accuracy))
                .build();
    }

    // ===== 5. VOCABULARY =====
    private VocabularyStats buildVocabularyStats(Long studentId) {
        long total = statsRepository.countVocabularyTotal(studentId);
        long learned = statsRepository.countVocabularyLearned(studentId);
        long learning = statsRepository.countVocabularyLearning(studentId);
        long notLearned = total - learned - learning;

        double learnedPercent = total > 0 ? (learned * 100.0) / total : 0.0;

        return VocabularyStats.builder()
                .total(total)
                .learned(learned)
                .learning(learning)
                .notLearned(notLearned)
                .learnedPercent(round1(learnedPercent))
                .build();
    }

    // ===== 6. TOP ERRORS — GỌN =====
    private List<ErrorStat> buildTopErrors(Long studentId) {
        List<Object[]> rows = statsRepository.countErrorsByType(studentId);

        List<ErrorStat> result = new ArrayList<>();

        for (Object[] row : rows) {
            String errorType = row[0] != null ? row[0].toString() : "UNKNOWN";
            long count = ((Number) row[1]).longValue();
            long high = row[2] != null ? ((Number) row[2]).longValue() : 0;
            long medium = row[3] != null ? ((Number) row[3]).longValue() : 0;
            long low = row[4] != null ? ((Number) row[4]).longValue() : 0;

            result.add(ErrorStat.builder()
                    .errorType(errorType)
                    .displayName(ErrorTypeHelper.displayName(errorType))
                    .count(count)
                    .highSeverity(high)
                    .mediumSeverity(medium)
                    .lowSeverity(low)
                    .build());
        }

        return result;
    }

    // ===== 7. WEEKLY ACTIVITY — ĐẾM CÂU HỎI =====
    private List<DailyActivity> buildWeeklyActivity(Long studentId) {
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

        List<DailyActivity> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = WEEKLY_DAYS - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            result.add(DailyActivity.builder()
                    .date(d)
                    .questionCount(map.getOrDefault(d, 0L))
                    .build());
        }

        return result;
    }

    // ===== 8. AI USAGE =====
    private AIUsageStats buildAIUsageStats(Long studentId) {
        long requests = statsRepository.countAIRequests(studentId);

        return AIUsageStats.builder()
                .totalRequests(requests)
                .build();
    }

    // =====================================================
    // UTILS
    // =====================================================

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private LocalDate toLocalDate(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Date sqlDate) return sqlDate.toLocalDate();
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