package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.constant.PracticeConstants;
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
import java.util.Comparator;
import java.util.List;
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
        log.info("Found student: {}, id: {}", student.getUser().getFullName(), studentId);

        List<String> weaknesses = getStudentWeaknesses(studentId);

        AIGenerateRequest aiRequest = AIGenerateRequest.builder()
                .level(request.getLevel())
                .sentenceType(request.getSentenceType())
                .topic(request.getTopic())
                .vocabularyWords(request.getVocabularyWords())
                .weaknesses(weaknesses)
                .build();

        AIGenerateResponse aiResponse = aiService.generateSentence(aiRequest);

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
        chat.setVocabularyWords(request.getVocabularyWords() != null ? request.getVocabularyWords() : new ArrayList<>());
        practiceChatRepository.save(chat);

        AIPracticeTurn turn = new AIPracticeTurn();
        turn.setPracticeChat(chat);
        turn.setQuestionOrder(1);
        turn.setVietnameseSentence(aiResponse.getVietnameseSentence());
        turn.setExpectedAnswer(aiResponse.getExpectedAnswer());
        turn.setBetterAnswers(null);
        turnRepository.save(turn);

        chat.setQuestionCount(1);
        practiceChatRepository.save(chat);
        studentMembershipService.incrementAIRequestCount(userId);
        log.info("Practice created successfully. Chat ID: {}, Turn ID: {}", chat.getId(), turn.getId());

        return buildPracticeChatResponse(chat, turn);
    }

    // ===== SUBMIT ANSWER =====
    @Override
    public EvaluationResponse submitAnswer(Long userId, SubmitAnswerRequest request) {

        log.info("Submitting answer for user: {}, turn: {}", userId, request.getTurnId());
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

        List<String> weaknesses = getStudentWeaknesses(studentId);

        AIEvaluateRequest aiRequest = AIEvaluateRequest.builder()
                .vietnameseSentence(turn.getVietnameseSentence())
                .expectedAnswer(turn.getExpectedAnswer())
                .studentAnswer(request.getStudentAnswer())
                .level(chat.getLevel())
                .topic(chat.getTopic())
                .vocabularyWords(chat.getVocabularyWords())
                .weaknesses(weaknesses)
                .build();

        long startTime = System.currentTimeMillis();
        AIEvaluateResponse aiResponse = aiService.evaluateAndGenerate(aiRequest);
        long responseTime = System.currentTimeMillis() - startTime;


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

        // Lưu betterAnswers - Dùng separator "|||"
        if (aiResponse.getBetterAnswers() != null && !aiResponse.getBetterAnswers().isEmpty()) {
            String betterAnswersStr = String.join("|||", aiResponse.getBetterAnswers());
            turn.setBetterAnswers(betterAnswersStr);
            turnRepository.save(turn);
        }

        // Save evaluation
        AIEvaluation evaluation = new AIEvaluation();
        evaluation.setAnswer(answer);
        evaluation.setCorrectness(aiResponse.getIsCorrect() ? "CORRECT" : "INCORRECT");
        evaluation.setScore(aiResponse.getScore());
        evaluation.setNaturalnessScore(aiResponse.getNaturalnessScore());
        evaluation.setFeedback(aiResponse.getFeedback());
        evaluationRepository.save(evaluation);

        // ============ SAVE ERRORS — CÓ VALIDATE ============
        List<AIError> errors = new ArrayList<>();
        if (aiResponse.getErrors() != null) {
            for (AIErrorResponse errorResp : aiResponse.getErrors()) {
                AIError error = new AIError();
                error.setEvaluation(evaluation);
                error.setErrorType(errorResp.getErrorType());
                error.setUserText(errorResp.getUserText());
                error.setCorrectText(errorResp.getCorrectText());
                error.setExplanation(errorResp.getExplanation());

                // ✅ VALIDATE + FALLBACK category/subtype
                String safeCategory = safeCategory(errorResp.getErrorCategory());
                String safeSubtype = safeSubtype(errorResp.getErrorSubtype());

                error.setErrorCategory(safeCategory);
                error.setErrorSubtype(safeSubtype);
                error.setErrorKey(safeCategory + "_" + safeSubtype);

                SeverityLevel severity;
                try {
                    severity = SeverityLevel.valueOf(errorResp.getSeverity());
                } catch (IllegalArgumentException e) {
                    log.warn("Unknown severity: {}, using MEDIUM as fallback", errorResp.getSeverity());
                    severity = SeverityLevel.MEDIUM;
                }
                error.setSeverity(severity);
                errors.add(error);
            }
            errorRepository.saveAll(errors);
        }

        // Update StudentAIError
        updateStudentAIErrors(studentId, errors);

        // Update chat progress
        boolean isCorrect = aiResponse.getIsCorrect() != null && aiResponse.getIsCorrect();
        chat.setQuestionCount(chat.getQuestionCount() + 1);
        if (isCorrect) {
            chat.setCorrectCount(chat.getCorrectCount() + 1);
        }

        boolean isCompleted = chat.getQuestionCount() >= chat.getQuestionLimit();
        if (isCompleted) {
            chat.setStatus(PracticeStatus.COMPLETED);
            chat.setCompletedAt(LocalDateTime.now());
        }
        practiceChatRepository.save(chat);

        // Update answer
        answer.setScore(aiResponse.getScore());
        answer.setIsCorrect(isCorrect);
        answerRepository.save(answer);

        // Save AI Usage
        saveAIUsageWithTokens(studentId, chat, RequestType.GENERATE_AND_EVALUATE,
                provider, modelName,
                responseTime, true, null, usage);

        // Build response
        EvaluationResponse response = buildEvaluationResponse(aiResponse, chat, isCompleted);

        // Create next question if not completed
        if (!isCompleted && aiResponse.getNextQuestion() != null) {
            AIPracticeTurn nextTurn = new AIPracticeTurn();
            nextTurn.setPracticeChat(chat);
            nextTurn.setQuestionOrder(chat.getQuestionCount() + 1);
            nextTurn.setVietnameseSentence(aiResponse.getNextQuestion().getVietnameseSentence());
            nextTurn.setExpectedAnswer(aiResponse.getNextQuestion().getExpectedAnswer());
            nextTurn.setBetterAnswers(null);
            turnRepository.save(nextTurn);

            response.setNextQuestion(TurnResponse.builder()
                    .id(nextTurn.getId())
                    .questionOrder(nextTurn.getQuestionOrder())
                    .vietnameseSentence(nextTurn.getVietnameseSentence())
                    .createdAt(nextTurn.getCreatedAt())
                    .build());
        }

        log.info("Answer submitted successfully. Turn: {}, Correct: {}, Score: {}",
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

    // ===== GET PRACTICE HISTORY =====
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

    // ===== GET PRACTICE RESULT =====
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
                if (answer.getIsCorrect() != null && answer.getIsCorrect()) {
                    correct++;
                }
                if (answer.getScore() != null) {
                    totalScore += answer.getScore();
                }

                if (answer.getEvaluation() != null && answer.getEvaluation().getErrors() != null) {
                    for (AIError error : answer.getEvaluation().getErrors()) {
                        // ✅ Dùng errorKey để group chi tiết (KHÔNG dùng errorType)
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
                            // ✅ Lấy displayName tiếng Việt
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
        if (commonErrors.size() > 5) {
            commonErrors = commonErrors.subList(0, 5);
        }

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
    }

    private List<String> getStudentWeaknesses(Long studentId) {
        List<StudentAIError> weaknesses = studentAIErrorRepository
                .findByStudentIdOrderByMasteryScoreAsc(studentId);

        return weaknesses.stream()
                .filter(e -> e.getMasteryScore() < PracticeConstants.WEAKNESS_THRESHOLD)
                .limit(PracticeConstants.MAX_WEAKNESSES)
                .map(StudentAIError::getErrorType)
                .collect(Collectors.toList());
    }

    // ============ UPDATE WEAKNESS ============
    private void updateStudentAIErrors(Long studentId, List<AIError> errors) {
        for (AIError error : errors) {
            String errorKey = error.getErrorKey();
            if (errorKey == null || errorKey.isEmpty()) {
                errorKey = ErrorSubtype.buildErrorKey(
                        error.getErrorCategory(),
                        error.getErrorSubtype()
                );
            }

            StudentAIError studentError = studentAIErrorRepository
                    .findByStudentIdAndErrorKey(studentId, errorKey)
                    .orElse(null);

            if (studentError == null) {
                // ✅ Tạo mới
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

                String exampleJson = toJsonArray(List.of(
                        error.getUserText() != null ? error.getUserText() : ""
                ));
                studentError.setExamples(exampleJson);

                log.info("✅ Tạo weakness mới: studentId={}, errorKey={}", studentId, errorKey);
            } else {
                // ✅ Cập nhật
                studentError.setOccurrenceCount(studentError.getOccurrenceCount() + 1);
                studentError.setLastOccurredAt(LocalDateTime.now());

                int newMastery = Math.max(0, studentError.getMasteryScore() - 10);
                studentError.setMasteryScore(newMastery);

                studentError.setExamples(addExample(
                        studentError.getExamples(),
                        error.getUserText()
                ));

                log.info("✅ Cập nhật weakness: studentId={}, errorKey={}, count={}",
                        studentId, errorKey, studentError.getOccurrenceCount());
            }
            studentAIErrorRepository.save(studentError);
        }
    }

    // ===== HELPER: Convert list to JSON =====
    private String toJsonArray(List<String> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            log.warn("Lỗi convert to JSON: {}", e.getMessage());
            return "[]";
        }
    }

    // ===== HELPER: Thêm example mới, giữ max 5 =====
    private String addExample(String currentJson, String newExample) {
        try {
            List<String> examples = new ArrayList<>();
            if (currentJson != null && !currentJson.isEmpty() && !currentJson.equals("[]")) {
                examples = objectMapper.readValue(
                        currentJson,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
            }
            if (newExample != null && !newExample.isEmpty()) {
                examples.add(newExample);
            }
            if (examples.size() > 5) {
                examples = examples.subList(examples.size() - 5, examples.size());
            }
            return objectMapper.writeValueAsString(examples);
        } catch (Exception e) {
            log.warn("Lỗi xử lý examples: {}", e.getMessage());
            return "[]";
        }
    }

    // ===== ✅ HELPER MỚI: Safe category =====
    private String safeCategory(String raw) {
        if (raw == null || raw.isBlank()) {
            return "TENSE";
        }
        String upper = raw.toUpperCase().trim();
        try {
            ErrorCategory.valueOf(upper);
            return upper;
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Category lạ: {} → fallback TENSE", raw);
            return "TENSE";
        }
    }

    // ===== ✅ HELPER MỚI: Safe subtype =====
    private String safeSubtype(String raw) {
        if (raw == null || raw.isBlank()) {
            return "MIXED_TENSE";
        }
        String upper = raw.toUpperCase().trim();
        try {
            ErrorSubtype.valueOf(upper);
            return upper;
        } catch (IllegalArgumentException e) {
            // Fuzzy match: subtype bắt đầu bằng subtype hợp lệ
            for (ErrorSubtype valid : ErrorSubtype.values()) {
                if (upper.startsWith(valid.name())) {
                    log.info("✅ Fuzzy match: {} → {}", raw, valid.name());
                    return valid.name();
                }
            }
            log.warn("⚠️ Subtype lạ: {} → fallback MIXED_TENSE", raw);
            return "MIXED_TENSE";
        }
    }

    // Lưu AI Usage với chi phí và giá TẠI THỜI ĐIỂM - CHỈ DÙNG DATABASE
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

            log.info("✅ Saved AI Usage - Model: {}, Input: {}, Output: {}, Total: {}, Cost: {} VND",
                    model, inputTokens, outputTokens, totalTokens,
                    String.format("%,.0f", cost));
        } else {
            aiUsage.setInputTokens(0);
            aiUsage.setOutputTokens(0);
            aiUsage.setTotalTokens(0);
            aiUsage.setInputPricePerMillion(0.0);
            aiUsage.setOutputPricePerMillion(0.0);
            aiUsage.setEstimatedCost(BigDecimal.ZERO);
            log.warn("⚠️ No token usage available for this request");
        }

        aiUsage.setResponseTimeMs((int) responseTime);
        aiUsage.setSuccess(success);
        aiUsage.setErrorMessage(errorMessage);
        aiUsageRepository.save(aiUsage);
    }

    private PracticeChatResponse buildPracticeChatResponse(AIPracticeChat chat, AIPracticeTurn currentTurn) {
        TurnResponse turnResponse = null;
        if (currentTurn != null) {
            turnResponse = TurnResponse.builder()
                    .id(currentTurn.getId())
                    .questionOrder(currentTurn.getQuestionOrder())
                    .vietnameseSentence(currentTurn.getVietnameseSentence())
                    .createdAt(currentTurn.getCreatedAt())
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
        if (betterAnswersStr == null || betterAnswersStr.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(betterAnswersStr.split("\\|\\|\\|"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // ============ GET WEAKNESSES ============
    @Override
    public List<StudentWeaknessResponse> getStudentWeaknessesWithDetails(Long userId) {
        log.info("Getting student weaknesses with details for user: {}", userId);

        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin học viên"));

        Long studentId = student.getId();

        List<StudentAIError> weaknesses = studentAIErrorRepository
                .findByStudentIdOrderByMasteryScoreAsc(studentId);

        if (weaknesses.isEmpty()) {
            log.info("No weaknesses found for student: {}", studentId);
            return new ArrayList<>();
        }

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