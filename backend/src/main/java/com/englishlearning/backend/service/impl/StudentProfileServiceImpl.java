package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.StudentProfileResponse;
import com.englishlearning.backend.dto.response.StudentProfileResponse.*;
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
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentRepository studentRepository;
    private final StudentMembershipRepository studentMembershipRepository;
    private final AIRequestDailyLogRepository aiRequestDailyLogRepository;
    private final StudentAIErrorRepository studentAIErrorRepository;
    private final StudentVocabularyRepository studentVocabularyRepository;
    private final ListeningAnswerRepository listeningAnswerRepository;
    private final AIUsageRepository aiUsageRepository;
    private final AIPracticeChatRepository aiPracticeChatRepository;
    private final AIErrorRepository aiErrorRepository;

    private static final int MAX_WEAKNESSES = 5;
    private static final int MAX_RECENT_WORDS = 5;

    @Override
    public StudentProfileResponse getMyProfile(Long userId) {

        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông tin học viên"
                ));

        User user = student.getUser();
        Long studentId = student.getId();

        log.info("Building profile for user: {}, studentId: {}", user.getFullName(), studentId);

        UserInfo userInfo = buildUserInfo(user);
        LevelInfo levelInfo = buildLevelInfo(student);
        StatsInfo statsInfo = buildStatsInfo(student);
        MembershipInfo membershipInfo = buildMembershipInfo(student, studentId);
        List<WeaknessInfo> weaknesses = buildWeaknesses(studentId);
        VocabularyInfo vocabularyInfo = buildVocabularyInfo(studentId);

        return StudentProfileResponse.builder()
                .user(userInfo)
                .level(levelInfo)
                .stats(statsInfo)
                .membership(membershipInfo)
                .weaknesses(weaknesses)
                .vocabulary(vocabularyInfo)
                .build();
    }

    // =====================================================
    // 1. USER INFO
    // =====================================================
    private UserInfo buildUserInfo(User user) {
        String fullName = user.getFullName() != null ? user.getFullName() : "Học viên";
        String initial = !fullName.isEmpty()
                ? String.valueOf(fullName.charAt(0)).toUpperCase()
                : "?";

        return UserInfo.builder()
                .id(user.getId())
                .fullName(fullName)
                .email(user.getEmail())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .joinDate(user.getCreatedAt())
                .avatarInitial(initial)
                .build();
    }

    // =====================================================
    // 2. LEVEL INFO
    // =====================================================
    private LevelInfo buildLevelInfo(Student student) {
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

        return LevelInfo.builder()
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
    // 3. STATS INFO
    // =====================================================
    private StatsInfo buildStatsInfo(Student student) {
        Long studentId = student.getId();

        List<AIPracticeChat> chats = aiPracticeChatRepository
                .findByStudentIdOrderByCreatedAtDesc(studentId);

        long totalQuestions = 0;
        long totalCorrect = 0;
        for (AIPracticeChat chat : chats) {
            if (chat.getQuestionCount() != null) totalQuestions += chat.getQuestionCount();
            if (chat.getCorrectCount() != null) totalCorrect += chat.getCorrectCount();
        }
        double accuracy = totalQuestions > 0
                ? (totalCorrect * 100.0) / totalQuestions
                : 0.0;

        long totalListening = listeningAnswerRepository.countByStudentIdAndIsCorrectTrue(studentId);
        Integer ranking = calculateRanking(student);

        return StatsInfo.builder()
                .totalXp(student.getExperience() != null ? student.getExperience() : 0)
                .totalCompletedTopics(student.getTotalCompletedTopic() != null
                        ? student.getTotalCompletedTopic() : 0)
                .accuracyRate(Math.round(accuracy * 10.0) / 10.0)
                .ranking(ranking)
                .totalListeningAnswers(totalListening)
                .totalAiAnswers(totalQuestions)
                .build();
    }

    private Integer calculateRanking(Student student) {
        try {
            int myXp = student.getExperience() != null ? student.getExperience() : 0;
            long totalStudents = studentRepository.count();
            if (totalStudents == 0) return 100;

            long higherCount = studentRepository.findAll().stream()
                    .filter(s -> s.getExperience() != null
                            && s.getExperience() > myXp
                            && !s.getId().equals(student.getId()))
                    .count();

            double topPercent = ((higherCount + 1.0) / totalStudents) * 100.0;
            return (int) Math.ceil(topPercent);

        } catch (Exception e) {
            log.warn("Không thể tính ranking: {}", e.getMessage());
            return null;
        }
    }

    // =====================================================
    // 4. MEMBERSHIP INFO
    // =====================================================
    private MembershipInfo buildMembershipInfo(Student student, Long studentId) {

        Optional<StudentMembership> optionalMembership =
                studentMembershipRepository
                        .findFirstByStudentIdAndStatusOrderByEndDateDesc(
                                studentId,
                                StudentMembershipStatus.ACTIVE
                        );

        LocalDate today = LocalDate.now();

        if (optionalMembership.isEmpty()
                || optionalMembership.get().getEndDate().isBefore(today)) {
            return MembershipInfo.builder()
                    .hasMembership(false)
                    .aiUsage(buildAiUsageInfo(0, null, false))
                    .build();
        }

        StudentMembership membership = optionalMembership.get();
        MembershipPackage pkg = membership.getMembershipPackage();

        long remainingDays = ChronoUnit.DAYS.between(today, membership.getEndDate());

        int limit = pkg.getDailyAiRequestLimit() != null
                ? pkg.getDailyAiRequestLimit() : 0;

        int used = aiRequestDailyLogRepository
                .findByStudentIdAndRequestDate(studentId, today)
                .map(AIRequestDailyLog::getRequestCount)
                .orElse(0);

        boolean canMake = (limit == 0) || (used < limit);

        return MembershipInfo.builder()
                .hasMembership(true)
                .packageName(pkg.getName())
                .startDate(membership.getStartDate())
                .endDate(membership.getEndDate())
                .remainingDays(remainingDays)
                .aiUsage(buildAiUsageInfo(used, limit, canMake))
                .build();
    }

    private AiUsageInfo buildAiUsageInfo(int used, Integer limit, boolean canMake) {
        int limitValue = limit != null ? limit : 0;
        int remaining = limitValue > 0 ? Math.max(0, limitValue - used) : 0;
        double percent = limitValue > 0 ? (used * 100.0) / limitValue : 0.0;

        return AiUsageInfo.builder()
                .limit(limitValue)
                .used(used)
                .remaining(remaining)
                .percent(Math.round(percent * 10.0) / 10.0)
                .canMakeRequest(canMake)
                .build();
    }

    // =====================================================
    // 5. WEAKNESSES
    // =====================================================
    private List<WeaknessInfo> buildWeaknesses(Long studentId) {
        List<StudentAIError> errors = studentAIErrorRepository
                .findTop5ByStudentIdOrderByMasteryScoreAsc(studentId);

        if (errors.isEmpty()) {
            return new ArrayList<>();
        }

        return errors.stream()
                .limit(MAX_WEAKNESSES)
                .map(e -> {
                    String displayName = getDisplayName(e.getErrorType());
                    String level = getWeaknessLevel(e.getMasteryScore());
                    String suggestion = getSuggestion(e.getErrorType());

                    // ✅ Lấy ví dụ lỗi mới nhất cho loại lỗi này
                    AIError latestError = findLatestErrorByType(
                            studentId,
                            e.getErrorType()
                    );

                    return WeaknessInfo.builder()
                            .errorType(e.getErrorType())
                            .displayName(displayName)
                            .occurrenceCount(e.getOccurrenceCount())
                            .correctedCount(e.getCorrectedCount())
                            .masteryScore(e.getMasteryScore())
                            .level(level)
                            .suggestion(suggestion)
                            .exampleWrong(latestError != null ? latestError.getUserText() : null)
                            .exampleCorrect(latestError != null ? latestError.getCorrectText() : null)
                            .explanation(latestError != null ? latestError.getExplanation() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Tìm lỗi mới nhất của student theo errorType
     */
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

    private String getDisplayName(String errorType) {
        Map<String, String> map = Map.ofEntries(
                Map.entry("GRAMMAR", "Ngữ pháp"),
                Map.entry("VOCABULARY", "Từ vựng"),
                Map.entry("ARTICLE", "Mạo từ"),
                Map.entry("PREPOSITION", "Giới từ"),
                Map.entry("TENSE", "Thì"),
                Map.entry("WORD_ORDER", "Trật tự từ"),
                Map.entry("SPELLING", "Chính tả"),
                Map.entry("WORD_CHOICE", "Lựa chọn từ"),
                Map.entry("NATURALNESS", "Độ tự nhiên"),
                Map.entry("MISSING_WORD", "Thiếu từ"),
                Map.entry("EXTRA_WORD", "Thừa từ"),
                Map.entry("PUNCTUATION", "Dấu câu"),
                Map.entry("CAPITALIZATION", "Viết hoa")
        );
        return map.getOrDefault(errorType, errorType);
    }

    private String getWeaknessLevel(int masteryScore) {
        if (masteryScore < 30) return "Yếu";
        if (masteryScore < 60) return "Trung bình";
        return "Khá";
    }

    private String getSuggestion(String errorType) {
        Map<String, String> map = Map.ofEntries(
                Map.entry("GRAMMAR", "Ôn tập cấu trúc ngữ pháp cơ bản"),
                Map.entry("VOCABULARY", "Học thêm từ vựng theo chủ đề"),
                Map.entry("ARTICLE", "Ôn quy tắc dùng a/an/the"),
                Map.entry("PREPOSITION", "Học các cụm giới từ thông dụng"),
                Map.entry("TENSE", "Ôn thì và cách dùng"),
                Map.entry("WORD_ORDER", "Ôn trật tự từ trong câu"),
                Map.entry("SPELLING", "Luyện viết chính tả"),
                Map.entry("WORD_CHOICE", "Luyện chọn từ phù hợp ngữ cảnh"),
                Map.entry("NATURALNESS", "Đọc nhiều để cải thiện độ tự nhiên"),
                Map.entry("MISSING_WORD", "Kiểm tra câu trước khi gửi"),
                Map.entry("EXTRA_WORD", "Kiểm tra câu trước khi gửi"),
                Map.entry("PUNCTUATION", "Ôn quy tắc dùng dấu câu"),
                Map.entry("CAPITALIZATION", "Ôn quy tắc viết hoa")
        );
        return map.getOrDefault(errorType, "Luyện tập thêm");
    }

    // =====================================================
    // 6. VOCABULARY INFO
    // =====================================================
    private VocabularyInfo buildVocabularyInfo(Long studentId) {
        List<StudentVocabulary> all = studentVocabularyRepository.findByStudentId(studentId);

        long total = all.size();
        long learned = all.stream()
                .filter(v -> v.getLearningStatus() == LearningStatus.LEARNED)
                .count();
        long learning = all.stream()
                .filter(v -> v.getLearningStatus() == LearningStatus.LEARNING)
                .count();
        long notLearned = total - learned - learning;

        List<String> recentWords = all.stream()
                .sorted(Comparator.comparing(
                        StudentVocabulary::getSavedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(MAX_RECENT_WORDS)
                .map(v -> v.getVocabulary().getWord())
                .collect(Collectors.toList());

        return VocabularyInfo.builder()
                .total(total)
                .learned(learned)
                .learning(learning)
                .notLearned(notLearned)
                .recentWords(recentWords)
                .build();
    }
}