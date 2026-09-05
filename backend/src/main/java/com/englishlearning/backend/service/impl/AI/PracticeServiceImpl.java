package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.constant.PracticeConstants;
import com.englishlearning.backend.dto.request.AIEvaluateRequest;
import com.englishlearning.backend.dto.request.AIGenerateRequest;
import com.englishlearning.backend.dto.request.CreatePracticeRequest;
import com.englishlearning.backend.dto.request.SubmitAnswerRequest;
import com.englishlearning.backend.dto.response.*;
import com.englishlearning.backend.entity.*;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
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

    // ===== CREATE PRACTICE =====
    @Override
    public PracticeChatResponse createPractice(Long userId, CreatePracticeRequest request) {
        log.info("Creating practice for user: {}", userId);

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

        log.info("Practice created successfully. Chat ID: {}, Turn ID: {}", chat.getId(), turn.getId());

        return buildPracticeChatResponse(chat, turn);
    }

    // ===== SUBMIT ANSWER =====
    @Override
    public EvaluationResponse submitAnswer(Long userId, SubmitAnswerRequest request) {
        log.info("Submitting answer for user: {}, turn: {}", userId, request.getTurnId());

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

        //  LƯU betterAnswers - Dùng separator "|||" thay vì ","
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

        // ✅ Save errors - KHÔNG cần parse Enum nữa
        List<AIError> errors = new ArrayList<>();
        if (aiResponse.getErrors() != null) {
            for (com.englishlearning.backend.dto.response.AIErrorResponse errorResp : aiResponse.getErrors()) {
                AIError error = new AIError();
                error.setEvaluation(evaluation);
                // ✅ Lưu trực tiếp String, không cần ErrorType.valueOf()
                error.setErrorType(errorResp.getErrorType());
                error.setUserText(errorResp.getUserText());
                error.setCorrectText(errorResp.getCorrectText());
                error.setExplanation(errorResp.getExplanation());

                // Xử lý severity an toàn
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
        saveAIUsage(studentId, chat, RequestType.GENERATE_AND_EVALUATE, "GEMINI", "gemini-2.0-flash",
                responseTime, true, null);

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

        // Build turn history với betterAnswers
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
                            // ✅ GỌI METHOD convertBetterAnswersToList
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
                        // ✅ Lấy trực tiếp String từ error
                        String errorType = error.getErrorType();
                        ErrorSummary summary = commonErrors.stream()
                                .filter(e -> e.getErrorType().equals(errorType))
                                .findFirst()
                                .orElse(null);

                        if (summary == null) {
                            summary = ErrorSummary.builder()
                                    .errorType(errorType)
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
                // ✅ Lấy trực tiếp String từ errorType
                .map(StudentAIError::getErrorType)
                .collect(Collectors.toList());
    }

    private void updateStudentAIErrors(Long studentId, List<AIError> errors) {
        for (AIError error : errors) {
            // ✅ Dùng String trực tiếp
            String errorKey = generateErrorKey(error.getErrorType(), error.getCorrectText());

            StudentAIError studentError = studentAIErrorRepository
                    .findByStudentIdAndErrorKey(studentId, errorKey)
                    .orElse(null);

            if (studentError == null) {
                studentError = new StudentAIError();
                studentError.setStudent(studentRepository.getReferenceById(studentId));
                // ✅ Lưu trực tiếp String
                studentError.setErrorType(error.getErrorType());
                studentError.setErrorKey(errorKey);
                studentError.setOccurrenceCount(1);
                studentError.setCorrectedCount(0);
                studentError.setMasteryScore(0);
                studentError.setLastOccurredAt(LocalDateTime.now());
            } else {
                studentError.setOccurrenceCount(studentError.getOccurrenceCount() + 1);
                studentError.setLastOccurredAt(LocalDateTime.now());
                int newMastery = Math.max(0, studentError.getMasteryScore() - 10);
                studentError.setMasteryScore(newMastery);
            }
            studentAIErrorRepository.save(studentError);
        }
    }

    // ✅ Cập nhật method generateErrorKey nhận String thay vì AIError
    private String generateErrorKey(String errorType, String correctText) {
        String corrected = correctText
                .replaceAll("[^a-zA-Z]", " ")
                .trim()
                .toUpperCase();
        if (corrected.length() > 20) {
            corrected = corrected.substring(0, 20);
        }
        return errorType + "_" + corrected.replaceAll(" ", "_");
    }

    private void saveAIUsage(Long studentId, AIPracticeChat chat, RequestType requestType,
                             String provider, String model, long responseTime,
                             boolean success, String errorMessage) {
        AIUsage usage = new AIUsage();
        usage.setStudent(studentRepository.getReferenceById(studentId));
        usage.setPracticeChat(chat);
        usage.setRequestType(requestType);
        usage.setProvider(provider);
        usage.setModel(model);
        usage.setInputTokens(0);
        usage.setOutputTokens(0);
        usage.setTotalTokens(0);
        usage.setEstimatedCost(BigDecimal.ZERO);
        usage.setResponseTimeMs((int) responseTime);
        usage.setSuccess(success);
        usage.setErrorMessage(errorMessage);
        aiUsageRepository.save(usage);
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
            for (com.englishlearning.backend.dto.response.AIErrorResponse error : aiResponse.getErrors()) {
                errorDetails.add(ErrorDetail.builder()
                        .errorType(error.getErrorType())
                        .userText(error.getUserText())
                        .correctText(error.getCorrectText())
                        .explanation(error.getExplanation())
                        .severity(error.getSeverity())
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
        // Dùng "|||" thay vì "," để tránh conflict với dấu phẩy trong câu
        return Arrays.stream(betterAnswersStr.split("\\|\\|\\|"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
    @Override
    public List<StudentWeaknessResponse> getStudentWeaknessesWithDetails(Long userId) {
        log.info("Getting student weaknesses with details for user: {}", userId);

        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin học viên"));

        Long studentId = student.getId();

        // Lấy danh sách điểm yếu từ database
        List<StudentAIError> weaknesses = studentAIErrorRepository
                .findByStudentIdOrderByMasteryScoreAsc(studentId);

        if (weaknesses.isEmpty()) {
            log.info("No weaknesses found for student: {}", studentId);
            return new ArrayList<>();
        }

        // Map sang DTO response
        return weaknesses.stream()
                .map(error -> StudentWeaknessResponse.builder()
                        .errorType(error.getErrorType())
                        .displayName(getDisplayName(error.getErrorType()))
                        .count(error.getOccurrenceCount())
                        .masteryScore(error.getMasteryScore())
                        .suggestion(getSuggestion(error.getErrorType()))
                        .build())
                .collect(Collectors.toList());
    }

    // ===== PRIVATE HELPER METHODS =====

    // ===== PRIVATE HELPER METHODS =====

    private String getDisplayName(String errorType) {
        Map<String, String> displayMap = Map.ofEntries(
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
        return displayMap.getOrDefault(errorType, errorType);
    }

    private String getSuggestion(String errorType) {
        Map<String, String> suggestionMap = Map.ofEntries(
                Map.entry("GRAMMAR", "Ôn tập cấu trúc ngữ pháp cơ bản"),
                Map.entry("VOCABULARY", "Học thêm từ vựng theo chủ đề"),
                Map.entry("ARTICLE", "Ôn quy tắc dùng a/an/the"),
                Map.entry("PREPOSITION", "Học các cụm giới từ thông dụng"),
                Map.entry("TENSE", "Ôn thì và cách dùng"),
                Map.entry("WORD_ORDER", "Ôn trật tự từ trong câu"),
                Map.entry("SPELLING", "Luyện viết chính tả"),
                Map.entry("WORD_CHOICE", "Luyện chọn từ phù hợp với ngữ cảnh"),
                Map.entry("NATURALNESS", "Đọc nhiều để cải thiện độ tự nhiên"),
                Map.entry("MISSING_WORD", "Kiểm tra câu trước khi gửi"),
                Map.entry("EXTRA_WORD", "Kiểm tra câu trước khi gửi"),
                Map.entry("PUNCTUATION", "Ôn quy tắc dùng dấu câu"),
                Map.entry("CAPITALIZATION", "Ôn quy tắc viết hoa")
        );
        return suggestionMap.getOrDefault(errorType, "Luyện tập thêm");
    }
}