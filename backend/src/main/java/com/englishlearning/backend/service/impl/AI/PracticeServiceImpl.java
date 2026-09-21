package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.constant.PracticeConstants;
import com.englishlearning.backend.constant.PromptConstants;
import com.englishlearning.backend.dto.request.AIEvaluateRequest;
import com.englishlearning.backend.dto.request.AIGenerateRequest;
import com.englishlearning.backend.dto.request.CreatePracticeRequest;
import com.englishlearning.backend.dto.request.SubmitAnswerRequest;
import com.englishlearning.backend.dto.response.*;
import com.englishlearning.backend.dto.response.gemini.GeminiUsageMetadata;
import com.englishlearning.backend.entity.*;
import com.englishlearning.backend.enums.ErrorCategory;
import com.englishlearning.backend.enums.ErrorSubtype;
import com.englishlearning.backend.enums.PracticeStatus;
import com.englishlearning.backend.enums.RequestType;
import com.englishlearning.backend.enums.SeverityLevel;
import com.englishlearning.backend.enums.SentenceType;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ErrorCode;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.*;
import com.englishlearning.backend.service.AI.AIService;
import com.englishlearning.backend.service.PracticeService;
import com.englishlearning.backend.service.PricingService;
import com.englishlearning.backend.service.StudentMembershipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PracticeServiceImpl implements PracticeService {

    private final AIService aiService;
    private final StudentRepository studentRepository;
    private final AIPracticeChatRepository practiceChatRepository;
    private final AIPracticeTurnRepository turnRepository;
    private final AIAnswerRepository answerRepository;
    private final AIEvaluationRepository evaluationRepository;
    private final AIErrorRepository errorRepository;
    private final StudentAIErrorRepository studentAIErrorRepository;
    private final AIUsageRepository aiUsageRepository;
    private final PricingService pricingService;
    private final StudentMembershipService studentMembershipService;
    private final ObjectMapper objectMapper;

    // ===== CREATE PRACTICE =====
    @Override
    public PracticeChatResponse createPractice(Long userId, CreatePracticeRequest request) {
        log.info("Creating practice for user: {}", userId);
        if (!studentMembershipService.hasActiveMembership(userId)) {
            throw new BusinessException(
                    "Chức năng Luyện tập AI yêu cầu gói Premium. Vui lòng đăng ký để sử dụng!"
            );
        }
        if (!studentMembershipService.canMakeAIRequest(userId)) {
            throw new BusinessException(
                    "Bạn đã hết lượt sử dụng AI hôm nay. Vui lòng quay lại vào ngày mai hoặc nâng cấp gói!"
            );
        }
        validateCreatePracticeRequest(request);

        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin học viên"));

        Long studentId = student.getId();

        List<String> weaknesses = new ArrayList<>();
        List<String> previousSentences = new ArrayList<>();

        // ✅ Câu 1: chưa có turn → pick 1-2 từ đầu tiên
        List<String> forcedWords = pickInitialForcedWords(request.getVocabularyWords());
        log.info("📌 Câu 1 forcedWords: {}", forcedWords);

        AIGenerateRequest aiRequest = AIGenerateRequest.builder()
                .level(request.getLevel())
                .sentenceType(request.getSentenceType())
                .topic(request.getTopic())
                .vocabularyWords(request.getVocabularyWords())
                .weaknesses(weaknesses)
                .previousSentences(previousSentences)
                .forcedWords(forcedWords)
                .build();

        AIGenerateResponse aiResponse = aiService.generateSentence(aiRequest);

        // ✅ Validate + retry 3 lần
        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            if (isForcedWordsPresent(aiResponse, forcedWords)) {
                break;
            }
            log.warn("⚠️ Attempt {}/{}: Câu không chứa forcedWords {}. Retry...",
                    attempt, maxAttempts, forcedWords);
            if (attempt < maxAttempts) {
                aiResponse = aiService.generateSentence(aiRequest);
            } else {
                log.error("❌ Hết retry. Chấp nhận câu hiện tại: {}",
                        aiResponse.getVietnameseSentence());
            }
        }

        AIPracticeChat chat = new AIPracticeChat();
        chat.setStudent(student);
        chat.setLevel(request.getLevel());
        chat.setSentenceType(SentenceType.valueOf(request.getSentenceType()));
        chat.setTopic(request.getTopic());
        chat.setQuestionLimit(request.getQuestionLimit());
        chat.setQuestionCount(0);
        chat.setCorrectCount(0);
        chat.setStatus(PracticeStatus.IN_PROGRESS);
        chat.setStartedAt(LocalDateTime.now());
        chat.setVocabularyWords(request.getVocabularyWords() != null
                ? request.getVocabularyWords() : new ArrayList<>());
        practiceChatRepository.save(chat);

        AIPracticeTurn turn = new AIPracticeTurn();
        turn.setPracticeChat(chat);
        turn.setQuestionOrder(1);
        turn.setVietnameseSentence(aiResponse.getVietnameseSentence());
        turn.setExpectedAnswer(aiResponse.getExpectedAnswer());
        turn.setBetterAnswers(null);
        // ✅ Chỉ lưu từ vựng nếu user có nạp + chỉ giữ từ trong danh sách
        turn.setUsedVocabulary(toJsonArray(
                sanitizeUsedVocabulary(aiResponse.getUsedVocabulary(), request.getVocabularyWords())
        ));
        turnRepository.save(turn);

        chat.setQuestionCount(1);
        practiceChatRepository.save(chat);
        studentMembershipService.incrementAIRequestCount(userId);
        log.info("Practice created. Chat ID: {}, Turn ID: {}, usedVocab: {}",
                chat.getId(), turn.getId(), parseUsedVocabulary(turn.getUsedVocabulary()));

        return buildPracticeChatResponse(chat, turn);
    }

    // ===== SUBMIT ANSWER =====
    @Override
    public EvaluationResponse submitAnswer(Long userId, SubmitAnswerRequest request) {

        log.info("Submitting answer for user: {}, turn: {}", userId, request.getTurnId());
        if (!studentMembershipService.hasActiveMembership(userId)) {
            throw new BusinessException(
                    "Chức năng Luyện tập AI yêu cầu gói Premium. Vui lòng đăng ký để sử dụng!");
        }
        if (!studentMembershipService.canMakeAIRequest(userId)) {
            throw new BusinessException(
                    "Bạn đã hết lượt sử dụng AI hôm nay. Vui lòng quay lại vào ngày mai!");
        }
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin học viên"));

        Long studentId = student.getId();

        AIPracticeTurn turn = turnRepository.findById(request.getTurnId())
                .orElseThrow(() -> new BusinessException(ErrorCode.TURN_NOT_FOUND));

        AIPracticeChat chat = turn.getPracticeChat();
        if (!chat.getStudent().getId().equals(studentId)) {
            throw new BusinessException(ErrorCode.TURN_NOT_BELONG_TO_CHAT);
        }
        if (chat.getStatus() != PracticeStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.PRACTICE_NOT_IN_PROGRESS);
        }
        if (answerRepository.existsByTurnId(turn.getId())) {
            throw new BusinessException(ErrorCode.TURN_ALREADY_ANSWERED);
        }
        if (request.getStudentAnswer().length() > PracticeConstants.MAX_ANSWER_LENGTH) {
            throw new BusinessException("Answer too long. Max: " + PracticeConstants.MAX_ANSWER_LENGTH);
        }

        // Save answer
        AIAnswer answer = new AIAnswer();
        answer.setTurn(turn);
        answer.setStudentAnswer(request.getStudentAnswer());
        answer.setAnsweredAt(LocalDateTime.now());
        answerRepository.save(answer);

        // ✅ Pick forcedWords cho câu tiếp theo
        List<String> forcedWords = pickForcedWords(chat.getId(), chat.getVocabularyWords());
        log.info("📌 Câu tiếp theo forcedWords: {}", forcedWords);

        List<String> weaknesses = getWeaknessesInChat(chat.getId());
        List<String> previousSentences = getPreviousSentences(chat.getId());

        AIEvaluateRequest aiRequest = AIEvaluateRequest.builder()
                .vietnameseSentence(turn.getVietnameseSentence())
                .expectedAnswer(turn.getExpectedAnswer())
                .studentAnswer(request.getStudentAnswer())
                .level(chat.getLevel())
                .topic(chat.getTopic())
                .vocabularyWords(chat.getVocabularyWords())
                .weaknesses(weaknesses)
                .sentenceType(chat.getSentenceType().name())
                .previousSentences(previousSentences)
                .forcedWords(forcedWords)
                .build();

        long startTime = System.currentTimeMillis();
        AIEvaluateResponse aiResponse = aiService.evaluateAndGenerate(aiRequest);
        long responseTime = System.currentTimeMillis() - startTime;

        // Sanitize errors
        sanitizeErrors(aiResponse);

        GeminiUsageMetadata usage = null;
        String modelName = "gemini-3.5-flash-lite";
        String provider = "GEMINI";

        if (aiService instanceof GeminiAIService) {
            GeminiAIService geminiService = (GeminiAIService) aiService;
            usage = geminiService.getCurrentUsage();
            modelName = geminiService.getCurrentModel();
            provider = geminiService.getCurrentProvider();
        }
        studentMembershipService.incrementAIRequestCount(userId);

        if (aiResponse.getBetterAnswers() != null && !aiResponse.getBetterAnswers().isEmpty()) {
            String betterAnswersStr = String.join("|||", aiResponse.getBetterAnswers());
            turn.setBetterAnswers(betterAnswersStr);
            turnRepository.save(turn);
        }

        AIEvaluation evaluation = new AIEvaluation();
        evaluation.setAnswer(answer);
        evaluation.setCorrectness(aiResponse.getIsCorrect() ? "CORRECT" : "INCORRECT");
        evaluation.setScore(aiResponse.getScore());
        evaluation.setNaturalnessScore(aiResponse.getNaturalnessScore());
        evaluation.setFeedback(aiResponse.getFeedback());
        evaluationRepository.save(evaluation);

        List<AIError> errors = new ArrayList<>();
        if (aiResponse.getErrors() != null) {
            for (AIErrorResponse errorResp : aiResponse.getErrors()) {
                AIError error = new AIError();
                error.setEvaluation(evaluation);
                error.setErrorType(errorResp.getErrorType());
                error.setUserText(errorResp.getUserText());
                error.setCorrectText(errorResp.getCorrectText());
                error.setExplanation(errorResp.getExplanation());

                String safeCategory = safeCategory(errorResp.getErrorCategory());
                String safeSubtype = safeSubtype(errorResp.getErrorSubtype(), safeCategory);

                error.setErrorCategory(safeCategory);
                error.setErrorSubtype(safeSubtype);
                error.setErrorKey(safeCategory + "_" + safeSubtype);

                SeverityLevel severity;
                try {
                    severity = SeverityLevel.valueOf(errorResp.getSeverity());
                } catch (IllegalArgumentException e) {
                    severity = SeverityLevel.MEDIUM;
                }
                error.setSeverity(severity);
                errors.add(error);
            }
            errorRepository.saveAll(errors);
        }

        updateStudentAIErrors(studentId, errors);

        boolean isCorrect = aiResponse.getIsCorrect() != null && aiResponse.getIsCorrect();
        chat.setQuestionCount(chat.getQuestionCount() + 1);
        if (isCorrect) chat.setCorrectCount(chat.getCorrectCount() + 1);

        boolean isCompleted = chat.getQuestionCount() >= chat.getQuestionLimit();
        if (isCompleted) {
            chat.setStatus(PracticeStatus.COMPLETED);
            chat.setCompletedAt(LocalDateTime.now());
        }
        practiceChatRepository.save(chat);

        answer.setScore(aiResponse.getScore());
        answer.setIsCorrect(isCorrect);
        answerRepository.save(answer);

        saveAIUsageWithTokens(studentId, chat, RequestType.GENERATE_AND_EVALUATE,
                provider, modelName, responseTime, true, null, usage);

        EvaluationResponse response = buildEvaluationResponse(aiResponse, chat, isCompleted);

        if (!isCompleted && aiResponse.getNextQuestion() != null) {
            // ✅ Sanitize usedVocabulary trước khi lưu + trả về
            List<String> sanitizedVocab = sanitizeUsedVocabulary(
                    aiResponse.getNextQuestion().getUsedVocabulary(),
                    chat.getVocabularyWords()
            );

            AIPracticeTurn nextTurn = new AIPracticeTurn();
            nextTurn.setPracticeChat(chat);
            nextTurn.setQuestionOrder(chat.getQuestionCount() + 1);
            nextTurn.setVietnameseSentence(aiResponse.getNextQuestion().getVietnameseSentence());
            nextTurn.setExpectedAnswer(aiResponse.getNextQuestion().getExpectedAnswer());
            nextTurn.setBetterAnswers(null);
            nextTurn.setUsedVocabulary(toJsonArray(sanitizedVocab));
            turnRepository.save(nextTurn);

            response.setNextQuestion(TurnResponse.builder()
                    .id(nextTurn.getId())
                    .questionOrder(nextTurn.getQuestionOrder())
                    .vietnameseSentence(nextTurn.getVietnameseSentence())
                    .createdAt(nextTurn.getCreatedAt())
                    .usedVocabulary(sanitizedVocab)
                    .build());
        }

        log.info("Answer submitted. Turn: {}, Correct: {}, Score: {}",
                turn.getId(), isCorrect, aiResponse.getScore());

        return response;
    }

    // ===== GET PRACTICE CHAT =====
    @Override
    public PracticeChatResponse getPracticeChat(Long practiceId, Long userId) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin học viên"));
        Long studentId = student.getId();

        AIPracticeChat chat = practiceChatRepository.findById(practiceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRACTICE_NOT_FOUND));

        if (!chat.getStudent().getId().equals(studentId)) {
            throw new BusinessException("Practice does not belong to student");
        }

        List<AIPracticeTurn> allTurns = turnRepository
                .findByPracticeChatIdOrderByQuestionOrderAsc(practiceId);

        AIPracticeTurn currentTurn = allTurns.stream()
                .filter(turn -> turn.getAnswer() == null)
                .findFirst()
                .orElse(null);

        PracticeChatResponse response = buildPracticeChatResponse(chat, currentTurn);

        List<TurnHistoryResponse> turnHistory = allTurns.stream()
                .filter(turn -> turn.getAnswer() != null)
                .map(turn -> {
                    AIAnswer answer = turn.getAnswer();
                    AIEvaluation evaluation = answer.getEvaluation();

                    List<ErrorDetail> errorDetails = new ArrayList<>();
                    if (evaluation != null && evaluation.getErrors() != null) {
                        for (AIError error : evaluation.getErrors()) {
                            errorDetails.add(ErrorDetail.builder()
                                    .errorType(error.getErrorType())
                                    .userText(error.getUserText())
                                    .correctText(error.getCorrectText())
                                    .explanation(error.getExplanation())
                                    .severity(error.getSeverity().name())
                                    .errorCategory(error.getErrorCategory())
                                    .errorSubtype(error.getErrorSubtype())
                                    .build());
                        }
                    }

                    return TurnHistoryResponse.builder()
                            .id(turn.getId())
                            .questionOrder(turn.getQuestionOrder())
                            .vietnameseSentence(turn.getVietnameseSentence())
                            .studentAnswer(answer.getStudentAnswer())
                            .score(answer.getScore())
                            .isCorrect(answer.getIsCorrect())
                            .feedback(evaluation != null ? evaluation.getFeedback() : null)
                            .naturalnessScore(evaluation != null ? evaluation.getNaturalnessScore() : null)
                            .errors(errorDetails)
                            .betterAnswers(convertBetterAnswersToList(turn.getBetterAnswers()))
                            .build();
                })
                .collect(Collectors.toList());

        response.setTurnHistory(turnHistory);
        return response;
    }

    // ===== GET HISTORY =====
    @Override
    public List<PracticeChatResponse> getPracticeHistory(Long userId) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin học viên"));
        Long studentId = student.getId();

        List<AIPracticeChat> chats = practiceChatRepository
                .findByStudentIdOrderByCreatedAtDesc(studentId);

        return chats.stream()
                .map(chat -> buildPracticeChatResponse(chat, null))
                .collect(Collectors.toList());
    }

    // ===== GET RESULT =====
    @Override
    public PracticeResultResponse getPracticeResult(Long practiceId, Long userId) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin học viên"));
        Long studentId = student.getId();

        AIPracticeChat chat = practiceChatRepository.findById(practiceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRACTICE_NOT_FOUND));

        if (!chat.getStudent().getId().equals(studentId)) {
            throw new BusinessException("Practice does not belong to student");
        }
        if (chat.getStatus() != PracticeStatus.COMPLETED) {
            throw new BusinessException("Practice is not completed yet");
        }

        List<AIPracticeTurn> turns = turnRepository.findByPracticeChatIdOrderByQuestionOrderAsc(practiceId);

        int total = turns.size();
        int correct = 0;
        int totalScore = 0;
        List<ErrorSummary> commonErrors = new ArrayList<>();

        for (AIPracticeTurn turn : turns) {
            if (turn.getAnswer() != null) {
                AIAnswer answer = turn.getAnswer();
                if (answer.getIsCorrect() != null && answer.getIsCorrect()) correct++;
                if (answer.getScore() != null) totalScore += answer.getScore();

                if (answer.getEvaluation() != null && answer.getEvaluation().getErrors() != null) {
                    for (AIError error : answer.getEvaluation().getErrors()) {
                        String errorKey = error.getErrorKey();
                        if (errorKey == null || errorKey.isEmpty()) {
                            errorKey = (error.getErrorCategory() != null && error.getErrorSubtype() != null)
                                    ? error.getErrorCategory() + "_" + error.getErrorSubtype()
                                    : error.getErrorType();
                        }
                        final String finalErrorKey = errorKey;

                        ErrorSummary summary = commonErrors.stream()
                                .filter(e -> e.getErrorType().equals(finalErrorKey))
                                .findFirst()
                                .orElse(null);

                        if (summary == null) {
                            String displayName = null;
                            try {
                                ErrorSubtype subtypeEnum = ErrorSubtype.fromString(error.getErrorSubtype());
                                displayName = subtypeEnum.getDisplayName();
                            } catch (Exception ignored) {}

                            summary = ErrorSummary.builder()
                                    .errorType(errorKey)
                                    .errorCategory(error.getErrorCategory())
                                    .errorSubtype(error.getErrorSubtype())
                                    .displayName(displayName)
                                    .count(0)
                                    .example(error.getUserText())
                                    .build();
                            commonErrors.add(summary);
                        }
                        summary.setCount(summary.getCount() + 1);
                    }
                }
            }
        }

        commonErrors.sort((a, b) -> b.getCount().compareTo(a.getCount()));
        if (commonErrors.size() > 5) commonErrors = commonErrors.subList(0, 5);

        double accuracy = total > 0 ? (correct * 100.0 / total) : 0;
        double avgScore = total > 0 ? (totalScore * 1.0 / total) : 0;

        return PracticeResultResponse.builder()
                .practiceId(chat.getId())
                .level(chat.getLevel())
                .topic(chat.getTopic())
                .totalQuestions(total)
                .correctAnswers(correct)
                .accuracy(Math.round(accuracy * 100.0) / 100.0)
                .averageScore(Math.round(avgScore * 100.0) / 100.0)
                .completedAt(chat.getCompletedAt())
                .commonErrors(commonErrors)
                .build();
    }

    // ===== PRIVATE METHODS =====

    private void validateCreatePracticeRequest(CreatePracticeRequest request) {
        if (!PracticeConstants.VALID_LEVELS.contains(request.getLevel())) {
            throw new BusinessException(ErrorCode.INVALID_LEVEL);
        }
        if (!PracticeConstants.VALID_SENTENCE_TYPES.contains(request.getSentenceType())) {
            throw new BusinessException(ErrorCode.INVALID_SENTENCE_TYPE);
        }
        if (!PracticeConstants.VALID_TOPICS.contains(request.getTopic())) {
            throw new BusinessException(ErrorCode.INVALID_TOPIC);
        }
        if (request.getQuestionLimit() == null) {
            request.setQuestionLimit(PracticeConstants.DEFAULT_QUESTION_LIMIT);
        }
        if (!PracticeConstants.VALID_QUESTION_LIMITS.contains(request.getQuestionLimit())) {
            throw new BusinessException(ErrorCode.INVALID_QUESTION_LIMIT);
        }

        if (request.getVocabularyWords() != null
                && request.getVocabularyWords().size() > PracticeConstants.MAX_VOCABULARY_WORDS) {
            throw new BusinessException(
                    "Chỉ được nhập tối đa " + PracticeConstants.MAX_VOCABULARY_WORDS + " từ vựng");
        }

        if (request.getVocabularyWords() != null) {
            List<String> cleaned = request.getVocabularyWords().stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(String::toLowerCase)
                    .distinct()
                    .collect(Collectors.toList());
            request.setVocabularyWords(cleaned);
        }
    }

    // ============ ✅ SANITIZE USED VOCABULARY ============
    /**
     * Lọc usedVocabulary:
     * - Nếu chat KHÔNG có vocabularyWords → trả về [] (không có ý nghĩa)
     * - Nếu chat CÓ vocabularyWords → chỉ giữ các từ AI khai báo NẰM TRONG danh sách user nạp
     */
    private List<String> sanitizeUsedVocabulary(List<String> aiUsed, List<String> userVocab) {
        if (userVocab == null || userVocab.isEmpty()) {
            return new ArrayList<>();
        }
        if (aiUsed == null || aiUsed.isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> allowed = userVocab.stream()
                .filter(Objects::nonNull)
                .map(v -> v.toLowerCase().trim())
                .collect(Collectors.toSet());

        return aiUsed.stream()
                .filter(Objects::nonNull)
                .map(v -> v.toLowerCase().trim())
                .filter(allowed::contains)
                .distinct()
                .collect(Collectors.toList());
    }

    // ============ ✅ PICK FORCED WORDS CHO CÂU 1 ============
    private List<String> pickInitialForcedWords(List<String> vocabularyWords) {
        if (vocabularyWords == null || vocabularyWords.isEmpty()) {
            return new ArrayList<>();
        }
        int count = vocabularyWords.size() <= 2 ? 1 : 2;
        count = Math.min(count, vocabularyWords.size());
        return new ArrayList<>(vocabularyWords.subList(0, count));
    }

    // ============ ✅ PICK FORCED WORDS THEO TẦN SUẤT ============
    private List<String> pickForcedWords(Long chatId, List<String> vocabularyWords) {
        if (vocabularyWords == null || vocabularyWords.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, Long> freq = getVocabularyFrequency(chatId, vocabularyWords);

        List<String> sorted = vocabularyWords.stream()
                .sorted(Comparator
                        .comparingLong((String w) -> freq.getOrDefault(w.toLowerCase(), 0L))
                        .thenComparingInt(vocabularyWords::indexOf))
                .collect(Collectors.toList());

        int count = vocabularyWords.size() <= 2 ? 1 : 2;
        count = Math.min(count, sorted.size());

        List<String> result = new ArrayList<>(sorted.subList(0, count));
        Collections.shuffle(result);

        log.info("📌 Force: {} (tần suất: {})", result, freq);
        return result;
    }

    // ============ ✅ TÍNH TẦN SUẤT TỪ VỰNG ============
    private Map<String, Long> getVocabularyFrequency(Long chatId, List<String> vocabularyWords) {
        Map<String, Long> frequency = new HashMap<>();
        for (String v : vocabularyWords) {
            frequency.put(v.toLowerCase().trim(), 0L);
        }

        List<String> rawUsed = turnRepository.findUsedVocabularyByChatId(chatId);
        for (String json : rawUsed) {
            if (json == null || json.isBlank() || json.equals("[]")) continue;
            try {
                List<String> arr = objectMapper.readValue(
                        json,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
                for (String v : arr) {
                    String key = v.toLowerCase().trim();
                    if (frequency.containsKey(key)) {
                        frequency.merge(key, 1L, Long::sum);
                    }
                }
            } catch (Exception e) {
                log.warn("Lỗi parse usedVocabulary: {}", json);
            }
        }
        return frequency;
    }

    // ============ ✅ CHECK FORCED WORDS ============
    private boolean isForcedWordsPresent(AIGenerateResponse response, List<String> forcedWords) {
        if (forcedWords == null || forcedWords.isEmpty()) {
            return true;
        }
        if (response == null) return false;

        String expected = response.getExpectedAnswer();
        String expectedLower = expected != null ? expected.toLowerCase() : "";

        List<String> used = response.getUsedVocabulary();
        Set<String> usedSet = used != null
                ? used.stream().map(String::toLowerCase).collect(Collectors.toSet())
                : new HashSet<>();

        for (String w : forcedWords) {
            if (w == null || w.isBlank()) continue;
            String lower = w.toLowerCase().trim();

            if (usedSet.contains(lower)) continue;

            String pattern = ".*\\b" + java.util.regex.Pattern.quote(lower) + "\\b.*";
            if (expectedLower.matches(pattern)) continue;

            return false;
        }
        return true;
    }

    // ============ ✅ TO JSON ============
    private String toJsonArray(List<String> items) {
        if (items == null || items.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            return "[]";
        }
    }

    // ============ ✅ SANITIZE ERRORS ============
    private void sanitizeErrors(AIEvaluateResponse response) {
        if (response == null || response.getErrors() == null) return;

        List<AIErrorResponse> cleaned = new ArrayList<>();
        Set<String> seenKeys = new HashSet<>();

        for (AIErrorResponse e : response.getErrors()) {
            if (e == null) continue;

            String userText = e.getUserText() != null ? e.getUserText().trim() : "";
            String correctText = e.getCorrectText() != null ? e.getCorrectText().trim() : "";

            // Bỏ lỗi rác
            if (!userText.isEmpty() && userText.equalsIgnoreCase(correctText)) {
                continue;
            }

            // Dedup — cùng userText + cùng correctText
            String dedupKey = userText.toLowerCase() + "|" + correctText.toLowerCase();
            if (!userText.isEmpty() && seenKeys.contains(dedupKey)) {
                continue;
            }
            if (!userText.isEmpty()) seenKeys.add(dedupKey);

            // Fix MISSING_VERB giả
            if ("MISSING_VERB".equals(e.getErrorSubtype())) {
                String ut = userText.toLowerCase();
                boolean hasVerb = ut.matches(".*\\b(is|am|are|was|were|be|been|being|have|has|had|do|does|did|can|could|will|would|shall|should|may|might|must)\\b.*")
                        || ut.matches(".*\\b\\w+(s|es|ed|ing)\\b.*");
                if (hasVerb) {
                    log.info("🔧 [sanitize] MISSING_VERB giả: {} → WORD_CHOICE/WRONG_WORD", ut);
                    e.setErrorCategory("WORD_CHOICE");
                    e.setErrorSubtype("WRONG_WORD");
                    e.setErrorType("WORD_CHOICE");
                }
            }

            cleaned.add(e);
        }

        response.setErrors(cleaned);

        // Tất cả lỗi LOW → isCorrect = true
        if (Boolean.FALSE.equals(response.getIsCorrect()) && !cleaned.isEmpty()) {
            boolean allLow = cleaned.stream()
                    .allMatch(e -> "LOW".equalsIgnoreCase(e.getSeverity()));
            if (allLow) {
                log.info("🔧 [sanitize] Tất cả lỗi LOW → isCorrect = true");
                response.setIsCorrect(true);
            }
        }
    }

    // ============ WEAKNESSES ============
    private List<String> getWeaknessesInChat(Long chatId) {
        List<AIError> errorsInChat = errorRepository.findByChatId(chatId);
        if (errorsInChat.isEmpty()) return new ArrayList<>();

        Map<String, Long> errorCountMap = errorsInChat.stream()
                .filter(e -> e.getErrorKey() != null && !e.getErrorKey().isEmpty())
                .collect(Collectors.groupingBy(AIError::getErrorKey, Collectors.counting()));

        List<String> result = errorCountMap.entrySet().stream()
                .filter(entry -> entry.getValue() >= 2)
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(entry -> entry.getKey() + " (" + entry.getValue() + " lần)")
                .collect(Collectors.toList());

        return result;
    }

    private List<String> getPreviousSentences(Long chatId) {
        List<AIPracticeTurn> allTurns = turnRepository
                .findByPracticeChatIdOrderByQuestionOrderAsc(chatId);
        if (allTurns.isEmpty()) return new ArrayList<>();

        int fromIndex = Math.max(0, allTurns.size() - PromptConstants.MAX_PREVIOUS_SENTENCES);
        return allTurns.subList(fromIndex, allTurns.size())
                .stream()
                .map(AIPracticeTurn::getVietnameseSentence)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private void updateStudentAIErrors(Long studentId, List<AIError> errors) {
        for (AIError error : errors) {
            String errorKey = error.getErrorKey();
            if (errorKey == null || errorKey.isEmpty()) {
                errorKey = ErrorSubtype.buildErrorKey(error.getErrorCategory(), error.getErrorSubtype());
            }

            StudentAIError studentError = studentAIErrorRepository
                    .findByStudentIdAndErrorKey(studentId, errorKey)
                    .orElse(null);

            if (studentError == null) {
                studentError = new StudentAIError();
                studentError.setStudent(studentRepository.getReferenceById(studentId));
                studentError.setErrorCategory(error.getErrorCategory());
                studentError.setErrorSubtype(error.getErrorSubtype());
                studentError.setErrorKey(errorKey);
                studentError.setErrorType(error.getErrorType());
                studentError.setOccurrenceCount(1);
                studentError.setCorrectedCount(0);
                studentError.setMasteryScore(0);
                studentError.setFirstOccurredAt(LocalDateTime.now());
                studentError.setLastOccurredAt(LocalDateTime.now());
                studentError.setExamples(toJsonArray(List.of(
                        error.getUserText() != null ? error.getUserText() : "")));
            } else {
                studentError.setOccurrenceCount(studentError.getOccurrenceCount() + 1);
                studentError.setLastOccurredAt(LocalDateTime.now());
                int newMastery = Math.max(0, studentError.getMasteryScore() - 10);
                studentError.setMasteryScore(newMastery);
                studentError.setExamples(addExample(studentError.getExamples(), error.getUserText()));
            }
            studentAIErrorRepository.save(studentError);
        }
    }

    private String addExample(String currentJson, String newExample) {
        try {
            List<String> examples = new ArrayList<>();
            if (currentJson != null && !currentJson.isEmpty() && !currentJson.equals("[]")) {
                examples = objectMapper.readValue(
                        currentJson,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
            }
            if (newExample != null && !newExample.isEmpty()) examples.add(newExample);
            if (examples.size() > 5) examples = examples.subList(examples.size() - 5, examples.size());
            return objectMapper.writeValueAsString(examples);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String safeCategory(String raw) {
        if (raw == null || raw.isBlank()) return ErrorCategory.TENSE.name();
        String upper = raw.toUpperCase().trim();
        try {
            return ErrorCategory.valueOf(upper).name();
        } catch (IllegalArgumentException e) {
            return ErrorCategory.TENSE.name();
        }
    }

    private String safeSubtype(String raw, String safeCategory) {
        if (raw == null || raw.isBlank()) return fallbackSubtypeForCategory(safeCategory);
        String upper = raw.toUpperCase().trim();
        try {
            ErrorSubtype subtype = ErrorSubtype.valueOf(upper);
            if (subtype.getCategory().name().equals(safeCategory)) return subtype.name();
            return fallbackSubtypeForCategory(safeCategory);
        } catch (IllegalArgumentException ignored) {
            for (ErrorSubtype valid : ErrorSubtype.values()) {
                if (upper.startsWith(valid.name())
                        && valid.getCategory().name().equals(safeCategory)) {
                    return valid.name();
                }
            }
            return fallbackSubtypeForCategory(safeCategory);
        }
    }

    private String fallbackSubtypeForCategory(String category) {
        if (category == null) return ErrorSubtype.MIXED_TENSE.name();
        switch (category) {
            case "TENSE":       return ErrorSubtype.MIXED_TENSE.name();
            case "ARTICLE":     return ErrorSubtype.A_AN.name();
            case "PREPOSITION": return ErrorSubtype.TIME_IN.name();
            case "CONJUNCTION": return ErrorSubtype.WRONG_CONJUNCTION.name();
            case "STRUCTURE":   return ErrorSubtype.WORD_ORDER.name();
            case "POS":         return ErrorSubtype.ADJECTIVE_ADVERB.name();
            case "VERB":        return ErrorSubtype.GERUND_INFINITIVE.name();
            case "NATURALNESS": return ErrorSubtype.AWKWARD_PHRASING.name();
            case "SPELLING":    return ErrorSubtype.TYPO.name();
            case "WORD_CHOICE": return ErrorSubtype.WRONG_WORD.name();
            case "MEANING":     return ErrorSubtype.MISTRANSLATION.name();
            case "PUNCTUATION": return ErrorSubtype.MISSING_PUNCTUATION.name();
            default:            return ErrorSubtype.MIXED_TENSE.name();
        }
    }

    private void saveAIUsageWithTokens(Long studentId, AIPracticeChat chat, RequestType requestType,
                                       String provider, String model, long responseTime,
                                       boolean success, String errorMessage,
                                       GeminiUsageMetadata usage) {
        AIUsage aiUsage = new AIUsage();
        aiUsage.setStudent(studentRepository.getReferenceById(studentId));
        aiUsage.setPracticeChat(chat);
        aiUsage.setRequestType(requestType);
        aiUsage.setProvider(provider);
        aiUsage.setModel(model);

        if (usage != null) {
            int inputTokens = usage.getPromptTokenCount() != null ? usage.getPromptTokenCount() : 0;
            int outputTokens = usage.getCandidatesTokenCount() != null ? usage.getCandidatesTokenCount() : 0;
            int totalTokens = usage.getTotalTokenCount() != null ? usage.getTotalTokenCount() : 0;

            aiUsage.setInputTokens(inputTokens);
            aiUsage.setOutputTokens(outputTokens);
            aiUsage.setTotalTokens(totalTokens);

            BigDecimal cost = pricingService.calculateCost(provider, model, inputTokens, outputTokens);
            aiUsage.setEstimatedCost(cost);

            AIModelPricing pricing = pricingService.getCurrentPricing(provider, model);
            if (pricing != null) {
                aiUsage.setInputPricePerMillion(pricing.getInputPricePerMillionTokens().doubleValue());
                aiUsage.setOutputPricePerMillion(pricing.getOutputPricePerMillionTokens().doubleValue());
            } else {
                aiUsage.setInputPricePerMillion(0.0);
                aiUsage.setOutputPricePerMillion(0.0);
            }
        } else {
            aiUsage.setInputTokens(0);
            aiUsage.setOutputTokens(0);
            aiUsage.setTotalTokens(0);
            aiUsage.setInputPricePerMillion(0.0);
            aiUsage.setOutputPricePerMillion(0.0);
            aiUsage.setEstimatedCost(BigDecimal.ZERO);
        }

        aiUsage.setResponseTimeMs((int) responseTime);
        aiUsage.setSuccess(success);
        aiUsage.setErrorMessage(errorMessage);
        aiUsageRepository.save(aiUsage);
    }

    private PracticeChatResponse buildPracticeChatResponse(AIPracticeChat chat, AIPracticeTurn currentTurn) {
        TurnResponse turnResponse = null;
        if (currentTurn != null) {
            // ✅ Sanitize lại lần nữa (đề phòng data cũ trong DB)
            List<String> usedVocab = sanitizeUsedVocabulary(
                    parseUsedVocabulary(currentTurn.getUsedVocabulary()),
                    chat.getVocabularyWords()
            );

            turnResponse = TurnResponse.builder()
                    .id(currentTurn.getId())
                    .questionOrder(currentTurn.getQuestionOrder())
                    .vietnameseSentence(currentTurn.getVietnameseSentence())
                    .createdAt(currentTurn.getCreatedAt())
                    .usedVocabulary(usedVocab)
                    .build();
        }

        return PracticeChatResponse.builder()
                .id(chat.getId())
                .level(chat.getLevel())
                .topic(chat.getTopic())
                .sentenceType(chat.getSentenceType().name())
                .questionLimit(chat.getQuestionLimit())
                .questionCount(chat.getQuestionCount())
                .correctCount(chat.getCorrectCount())
                .status(chat.getStatus())
                .startedAt(chat.getStartedAt())
                .completedAt(chat.getCompletedAt())
                .vocabularyWords(chat.getVocabularyWords())
                .currentTurn(turnResponse)
                .build();
    }

    private List<String> parseUsedVocabulary(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return new ArrayList<>();
        try {
            return objectMapper.readValue(
                    json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private EvaluationResponse buildEvaluationResponse(AIEvaluateResponse aiResponse,
                                                       AIPracticeChat chat,
                                                       boolean isCompleted) {
        List<BetterAnswer> betterAnswers = new ArrayList<>();
        if (aiResponse.getBetterAnswers() != null) {
            for (String answer : aiResponse.getBetterAnswers()) {
                betterAnswers.add(BetterAnswer.builder()
                        .text(answer)
                        .description("Suggested improvement")
                        .build());
            }
        }

        List<ErrorDetail> errorDetails = new ArrayList<>();
        if (aiResponse.getErrors() != null) {
            for (AIErrorResponse error : aiResponse.getErrors()) {
                errorDetails.add(ErrorDetail.builder()
                        .errorType(error.getErrorType())
                        .userText(error.getUserText())
                        .correctText(error.getCorrectText())
                        .explanation(error.getExplanation())
                        .severity(error.getSeverity())
                        .errorCategory(error.getErrorCategory())
                        .errorSubtype(error.getErrorSubtype())
                        .build());
            }
        }

        return EvaluationResponse.builder()
                .isCorrect(aiResponse.getIsCorrect())
                .score(aiResponse.getScore())
                .naturalnessScore(aiResponse.getNaturalnessScore())
                .feedback(aiResponse.getFeedback())
                .betterAnswers(betterAnswers)
                .errors(errorDetails)
                .questionCount(chat.getQuestionCount())
                .totalQuestions(chat.getQuestionLimit())
                .isCompleted(isCompleted)
                .build();
    }

    private List<String> convertBetterAnswersToList(String betterAnswersStr) {
        if (betterAnswersStr == null || betterAnswersStr.isEmpty()) return new ArrayList<>();
        return Arrays.stream(betterAnswersStr.split("\\|\\|\\|"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // ============ GET WEAKNESSES ============
    @Override
    public List<StudentWeaknessResponse> getStudentWeaknessesWithDetails(Long userId) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin học viên"));
        Long studentId = student.getId();

        List<StudentAIError> weaknesses = studentAIErrorRepository
                .findByStudentIdOrderByMasteryScoreAsc(studentId);

        if (weaknesses.isEmpty()) return new ArrayList<>();

        return weaknesses.stream()
                .filter(e -> e.getMasteryScore() < 80)
                .sorted(Comparator.comparing(StudentAIError::getOccurrenceCount).reversed())
                .map(error -> {
                    ErrorSubtype subtype = ErrorSubtype.fromString(error.getErrorSubtype());
                    ErrorCategory category = null;
                    try {
                        category = ErrorCategory.valueOf(error.getErrorCategory());
                    } catch (Exception ignored) {}

                    return StudentWeaknessResponse.builder()
                            .errorKey(error.getErrorKey())
                            .category(error.getErrorCategory())
                            .subtype(error.getErrorSubtype())
                            .categoryDisplayName(category != null ? category.getDisplayName() : null)
                            .subtypeDescription(subtype.getDescription())
                            .displayName(subtype.getDisplayName())
                            .suggestion(subtype.getDescription())
                            .count(error.getOccurrenceCount())
                            .masteryScore(error.getMasteryScore())
                            .firstOccurredAt(error.getFirstOccurredAt())
                            .lastOccurredAt(error.getLastOccurredAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}