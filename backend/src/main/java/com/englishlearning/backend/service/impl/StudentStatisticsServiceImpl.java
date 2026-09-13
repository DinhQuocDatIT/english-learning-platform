package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.StudentStatisticsResponse;
import com.englishlearning.backend.dto.response.StudentStatisticsResponse.*;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.entity.StudentAIError;
import com.englishlearning.backend.enums.ErrorSubtype;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.StudentAIErrorRepository;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.repository.StudentStatisticsRepository;
import com.englishlearning.backend.service.StudentStatisticsService;
import com.englishlearning.backend.util.LevelCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
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
    private final StudentAIErrorRepository studentAIErrorRepository;

    private static final int WEEKLY_DAYS = 7;
    private static final int TOP_ERRORS_LIMIT = 10;
    private static final int MASTERY_THRESHOLD = 80;


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

    // ===== 6. TOP ERRORS — MỞ RỘNG =====
    private List<ErrorStat> buildTopErrors(Long studentId) {
        List<StudentAIError> errors = studentAIErrorRepository
                .findByStudentIdOrderByMasteryScoreAsc(studentId);

        if (errors.isEmpty()) {
            return new ArrayList<>();
        }

        return errors.stream()
                // Ẩn lỗi đã thành thạo (mastery >= 80)
                .filter(e -> e.getMasteryScore() == null || e.getMasteryScore() < MASTERY_THRESHOLD)
                // Sắp xếp: nhiều lần mắc trước, mastery thấp trước
                .sorted(
                        Comparator.comparing(StudentAIError::getOccurrenceCount,
                                        Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(StudentAIError::getMasteryScore,
                                        Comparator.nullsLast(Comparator.naturalOrder()))
                )
                .limit(TOP_ERRORS_LIMIT)
                .map(this::buildErrorStat)
                .toList();
    }

    /**
     * Build ErrorStat từ StudentAIError
     */
    private ErrorStat buildErrorStat(StudentAIError error) {
        // ✅ Lấy thông tin từ enum ErrorSubtype
        ErrorSubtype subtype = ErrorSubtype.fromString(error.getErrorSubtype());

        int count = error.getOccurrenceCount() != null ? error.getOccurrenceCount() : 0;
        int mastery = error.getMasteryScore() != null ? error.getMasteryScore() : 0;

        return ErrorStat.builder()
                // ============ CŨ ============
                .errorType(error.getErrorKey())
                .displayName(subtype.getDisplayName())
                .count((long) count)
                .highSeverity(0L)
                .mediumSeverity(0L)
                .lowSeverity(0L)
                // ============ MỚI — PHÂN LOẠI ============
                .errorCategory(error.getErrorCategory())
                .errorSubtype(error.getErrorSubtype())
                .errorKey(error.getErrorKey())
                // ============ MỚI — GIẢI THÍCH ============
                .description(subtype.getDescription())
                .example(getExample(error.getErrorSubtype()))
                .suggestion(subtype.getDescription())
                // ============ MỚI — TIẾN BỘ ============
                .masteryScore(mastery)
                .masteryLevel(calculateMasteryLevel(mastery))
                // ============ MỚI — XU HƯỚNG ============
                .trend(calculateTrend(error.getLastOccurredAt()))
                .severity(calculateSeverity(count, mastery))
                // ============ MỚI — THỜI GIAN ============
                .firstOccurredAt(error.getFirstOccurredAt())
                .lastOccurredAt(error.getLastOccurredAt())
                .build();
    }

    // ===== HELPER: MASTERY LEVEL =====
    private String calculateMasteryLevel(Integer score) {
        if (score == null) return "CHƯA ĐÁNH GIÁ";
        if (score < 20) return "YẾU";
        if (score < 50) return "TRUNG BÌNH";
        if (score < 80) return "KHÁ";
        return "TỐT";
    }

    // ===== HELPER: SEVERITY =====
    private String calculateSeverity(Integer count, Integer mastery) {
        if (count == null || count == 0) return "LOW";
        if (mastery == null) mastery = 0;
        if (count >= 5 && mastery < 30) return "HIGH";
        if (count >= 3 || mastery < 50) return "MEDIUM";
        return "LOW";
    }

    // ===== HELPER: TREND =====
    private String calculateTrend(LocalDateTime lastOccurredAt) {
        if (lastOccurredAt == null) return "STABLE";
        long days = Duration.between(lastOccurredAt, LocalDateTime.now()).toDays();
        if (days <= 3) return "UP";
        if (days <= 7) return "STABLE";
        return "DOWN";
    }

    // ===== HELPER: EXAMPLE =====
    private String getExample(String subtype) {
        if (subtype == null) return "";
        return switch (subtype) {
            // ===== TENSE =====
            case "PRESENT_SIMPLE" -> "She go → She goes";
            case "PRESENT_CONTINUOUS" -> "She is go → She is going";
            case "PRESENT_PERFECT" -> "I live here since 2020 → I have lived here since 2020";
            case "PRESENT_PERFECT_CONTINUOUS" -> "I have waited → I have been waiting";
            case "PAST_SIMPLE" -> "I go yesterday → I went yesterday";
            case "PAST_CONTINUOUS" -> "I was watch TV → I was watching TV";
            case "PAST_PERFECT" -> "When I arrived, he left → he had left";
            case "PAST_PERFECT_CONTINUOUS" -> "He had waited → He had been waiting";
            case "FUTURE_SIMPLE" -> "I go tomorrow → I will go tomorrow";
            case "FUTURE_CONTINUOUS" -> "At 8pm I will study → I will be studying";
            case "FUTURE_PERFECT" -> "By 2030, I finish → I will have finished";
            case "FUTURE_PERFECT_CONTINUOUS" -> "By 2030, I will work → will have been working";
            case "NEAR_FUTURE_GOING_TO" -> "I am going to visit (đã hẹn trước)";
            case "MIXED_TENSE" -> "Yesterday I go → Yesterday I went";

            // ===== ARTICLE =====
            case "A_AN" -> "a apple → an apple";
            case "THE" -> "I like the music → I like music";
            case "ZERO_ARTICLE" -> "I go to the school → I go to school";
            case "A_AN_VS_THE" -> "I saw a cat. The cat was black";

            // ===== PREPOSITION =====
            case "TIME_IN" -> "in Monday → on Monday";
            case "TIME_ON" -> "on 2024 → in 2024";
            case "TIME_AT" -> "at morning → in the morning";
            case "PLACE_IN" -> "at class → in the classroom";
            case "PLACE_ON" -> "on the room → in the room";
            case "PLACE_AT" -> "in home → at home";
            case "DIRECTION_TO" -> "I go in school → I go to school";
            case "MOVEMENT_INTO" -> "go in the room → go into the room";
            case "AGENT_BY" -> "written from him → written by him";
            case "INSTRUMENT_WITH" -> "cut by knife → cut with a knife";
            case "PHRASAL_VERB" -> "look after ≠ look for";
            case "ADJECTIVE_PREP" -> "interested on → interested in";
            case "VERB_PREP" -> "depend in → depend on";

            // ===== CONJUNCTION =====
            case "COORDINATING" -> "I like tea and coffee";
            case "SUBORDINATING" -> "Because it rains, I stay home";
            case "CORRELATIVE" -> "Both my mom and my dad...";
            case "CONNECTING_ADVERB" -> "I was tired. However, I kept working";
            case "WRONG_CONJUNCTION" -> "Because it rains, so I stay home → bỏ 'so'";

            // ===== STRUCTURE =====
            case "WORD_ORDER" -> "I very like it → I like it very much";
            case "SUBJECT_VERB_AGREEMENT" -> "She go → She goes, He play → He plays";
            case "MISSING_SUBJECT" -> "Is raining → It is raining";
            case "MISSING_VERB" -> "She happy → She is happy";
            case "MISSING_OBJECT" -> "I like → I like it";
            case "DOUBLE_NEGATIVE" -> "I don't know nothing → I don't know anything";
            case "DOUBLE_VERB" -> "She is go → She goes";
            case "REDUNDANCY" -> "return back → return";
            case "FRAGMENT" -> "Because I'm tired. → Because I'm tired, I go to bed";
            case "RUN_ON" -> "I like tea, I like coffee → I like tea and coffee";

            // ===== POS =====
            case "NOUN_ADJECTIVE" -> "a success man → a successful man";
            case "ADJECTIVE_ADVERB" -> "run quick → run quickly";
            case "VERB_NOUN" -> "make a decide → make a decision";
            case "PRONOUN" -> "Me go to school → I go to school";
            case "REFLEXIVE_PRONOUN" -> "I hurt me → I hurt myself";
            case "POSSESSIVE" -> "Its raining → It's raining";
            case "DEMONSTRATIVE" -> "this books → these books";
            case "QUANTIFIER" -> "much books → many books";
            case "DETERMINER" -> "a few money → a little money";

            // ===== VERB =====
            case "IRREGULAR_PAST" -> "goed → went, seed → saw";
            case "IRREGULAR_PAST_PARTICIPLE" -> "goed → gone, seed → seen";
            case "MODAL_VERB" -> "can to go → can go";
            case "GERUND_INFINITIVE" -> "want going → want to go";
            case "PASSIVE_VOICE" -> "is wrote → is written";
            case "CAUSATIVE" -> "make him to go → make him go";
            case "REPORTED_SPEECH" -> "He said 'I am tired' → He said he was tired";
            case "CONDITIONAL" -> "If I have time, I will learn → If I had time, I would learn";
            case "WISH_CLAUSE" -> "I wish I am rich → I wish I were rich";

            // ===== NATURALNESS =====
            case "VIETLISH" -> "I very like it → I really like it";
            case "LITERAL_TRANSLATION" -> "Thank you many much → Thank you very much";
            case "FORMALITY" -> "gonna → going to (trong email)";
            case "AWKWARD_PHRASING" -> "I have a question to ask you about → I have a question for you";

            default -> "";
        };
    }

    // ===== 7. WEEKLY ACTIVITY =====
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