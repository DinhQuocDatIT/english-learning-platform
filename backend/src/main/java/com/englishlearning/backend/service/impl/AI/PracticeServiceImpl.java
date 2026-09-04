package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.constant.PracticeConstants;
import com.englishlearning.backend.dto.request.AIEvaluateRequest;
import com.englishlearning.backend.dto.request.AIGenerateRequest;
import com.englishlearning.backend.dto.request.CreatePracticeRequest;
import com.englishlearning.backend.dto.request.SubmitAnswerRequest;
import com.englishlearning.backend.dto.response.*;
import com.englishlearning.backend.entity.*;
import com.englishlearning.backend.enums.ErrorType;
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

    // ===== CREATE PRACTICE =====
    @Override
    public PracticeChatResponse createPractice(Long userId, CreatePracticeRequest request) {
        log.info("Creating practice for user: {}", userId);

        // Validate request
        validateCreatePracticeRequest(request);

        // Get student from userId
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy thông tin học viên")
                );

        Long studentId = student.getId();
        log.info("Found student: {}, id: {}", student.getUser().getFullName(), studentId);
        System.out.println("weaknesses:1111111111111111111111111111111 ");
        // Get student weaknesses
        List<String> weaknesses = getStudentWeaknesses(studentId);
        System.out.println("weaknesses: " + weaknesses);
        // Generate first question
        AIGenerateRequest aiRequest = AIGenerateRequest.builder()
                .level(request.getLevel())
                .sentenceType(request.getSentenceType())
                .topic(request.getTopic())
                .vocabularyWords(request.getVocabularyWords())
                .weaknesses(weaknesses)
                .build();
        System.out.println("weaknesses:2222222222222222222222 ");
        AIGenerateResponse aiResponse = aiService.generateSentence(aiRequest);
        System.out.println("weaknesses:33333333333333333333333 ");
        // Create Practice Chat
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
        System.out.println("weaknesses:4444444444444444444444444444444444444 ");
        practiceChatRepository.save(chat);

        // Create first Turn
        AIPracticeTurn turn = new AIPracticeTurn();
        turn.setPracticeChat(chat);
        turn.setQuestionOrder(1);
        turn.setVietnameseSentence(aiResponse.getVietnameseSentence());
        turn.setExpectedAnswer(aiResponse.getExpectedAnswer());

        turnRepository.save(turn);

        // Update question count
        chat.setQuestionCount(1);
        practiceChatRepository.save(chat);

        log.info("Practice created successfully. Chat ID: {}, Turn ID: {}", chat.getId(), turn.getId());

        return buildPracticeChatResponse(chat, turn);
    }
    @Override
    public PracticeChatResponse getPracticeChat(Long practiceId, Long userId) {
        // Get student from userId
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy thông tin học viên")
                );

        Long studentId = student.getId();

        AIPracticeChat chat = practiceChatRepository.findById(practiceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRACTICE_NOT_FOUND));

        if (!chat.getStudent().getId().equals(studentId)) {
            throw new BusinessException("Practice does not belong to student");
        }

        // ✅ Lấy tất cả turns đã có (cả đã trả lời và chưa trả lời)
        List<AIPracticeTurn> allTurns = turnRepository
                .findByPracticeChatIdOrderByQuestionOrderAsc(practiceId);

        // ✅ Lấy current turn (chưa có answer)
        AIPracticeTurn currentTurn = allTurns.stream()
                .filter(turn -> turn.getAnswer() == null)
                .findFirst()
                .orElse(null);

        // ✅ Build response với danh sách turns
        PracticeChatResponse response = buildPracticeChatResponse(chat, currentTurn);

        // ✅ Thêm danh sách các turn đã trả lời vào response
        List<TurnHistoryResponse> turnHistory = allTurns.stream()
                .filter(turn -> turn.getAnswer() != null)
                .map(turn -> {
                    AIAnswer answer = turn.getAnswer();
                    AIEvaluation evaluation = answer.getEvaluation();

                    List<ErrorDetail> errorDetails = new ArrayList<>();
                    if (evaluation != null && evaluation.getErrors() != null) {
                        for (AIError error : evaluation.getErrors()) {
                            errorDetails.add(ErrorDetail.builder()
                                    .errorType(error.getErrorType().name())
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
                            .build();
                })
                .collect(Collectors.toList());

        response.setTurnHistory(turnHistory);

        return response;
    }
    // ===== SUBMIT ANSWER =====
    @Override
    public EvaluationResponse submitAnswer(Long userId, SubmitAnswerRequest request) {
        log.info("Submitting answer for user: {}, turn: {}", userId, request.getTurnId());

        // Get student from userId
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy thông tin học viên")
                );

        Long studentId = student.getId();

        // Get turn
        AIPracticeTurn turn = turnRepository.findById(request.getTurnId())
                .orElseThrow(() -> new BusinessException(ErrorCode.TURN_NOT_FOUND));

        // Validate turn belongs to student
        AIPracticeChat chat = turn.getPracticeChat();
        if (!chat.getStudent().getId().equals(studentId)) {
            throw new BusinessException(ErrorCode.TURN_NOT_BELONG_TO_CHAT);
        }

        // Validate chat is in progress
        if (chat.getStatus() != PracticeStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.PRACTICE_NOT_IN_PROGRESS);
        }

        // Check if already answered
        if (answerRepository.existsByTurnId(turn.getId())) {
            throw new BusinessException(ErrorCode.TURN_ALREADY_ANSWERED);
        }

        // Validate answer length
        if (request.getStudentAnswer().length() > PracticeConstants.MAX_ANSWER_LENGTH) {
            throw new BusinessException("Answer too long. Max: " + PracticeConstants.MAX_ANSWER_LENGTH);
        }

        // Save answer
        AIAnswer answer = new AIAnswer();
        answer.setTurn(turn);
        answer.setStudentAnswer(request.getStudentAnswer());
        answer.setAnsweredAt(LocalDateTime.now());
        answerRepository.save(answer);

        // Get student weaknesses
        List<String> weaknesses = getStudentWeaknesses(studentId);

        // Call AI to evaluate and generate next
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

        // Save evaluation
        AIEvaluation evaluation = new AIEvaluation();
        evaluation.setAnswer(answer);
        evaluation.setCorrectness(aiResponse.getIsCorrect() ? "CORRECT" : "INCORRECT");
        evaluation.setScore(aiResponse.getScore());
        evaluation.setNaturalnessScore(aiResponse.getNaturalnessScore());
        evaluation.setFeedback(aiResponse.getFeedback());
        evaluationRepository.save(evaluation);

        // Save errors
        List<AIError> errors = new ArrayList<>();
        if (aiResponse.getErrors() != null) {
            for (com.englishlearning.backend.dto.response.AIErrorResponse errorResp : aiResponse.getErrors()) {
                AIError error = new AIError();
                error.setEvaluation(evaluation);
                error.setErrorType(ErrorType.valueOf(errorResp.getErrorType()));
                error.setUserText(errorResp.getUserText());
                error.setCorrectText(errorResp.getCorrectText());
                error.setExplanation(errorResp.getExplanation());
                error.setSeverity(SeverityLevel.valueOf(errorResp.getSeverity()));
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

        // Check if completed
        boolean isCompleted = chat.getQuestionCount() >= chat.getQuestionLimit();
        if (isCompleted) {
            chat.setStatus(PracticeStatus.COMPLETED);
            chat.setCompletedAt(LocalDateTime.now());
        }

        practiceChatRepository.save(chat);

        // Update answer with score and isCorrect
        answer.setScore(aiResponse.getScore());
        answer.setIsCorrect(isCorrect);
        answerRepository.save(answer);

        // Save AI Usage
        saveAIUsage(studentId, chat, RequestType.GENERATE_AND_EVALUATE, "GEMINI", "gemini-2.0-flash",
                responseTime, true, null);

        // Build response
        EvaluationResponse response = buildEvaluationResponse(
                aiResponse,
                chat,
                isCompleted
        );

        // If not completed, add next question
        if (!isCompleted && aiResponse.getNextQuestion() != null) {
            AIPracticeTurn nextTurn = new AIPracticeTurn();
            nextTurn.setPracticeChat(chat);
            nextTurn.setQuestionOrder(chat.getQuestionCount() + 1);
            nextTurn.setVietnameseSentence(aiResponse.getNextQuestion().getVietnameseSentence());
            nextTurn.setExpectedAnswer(aiResponse.getNextQuestion().getExpectedAnswer());
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

    // ===== GET PRACTICE HISTORY =====
    @Override
    public List<PracticeChatResponse> getPracticeHistory(Long userId) {
        // Get student from userId
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy thông tin học viên")
                );

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
        // Get student from userId
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy thông tin học viên")
                );

        Long studentId = student.getId();

        AIPracticeChat chat = practiceChatRepository.findById(practiceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRACTICE_NOT_FOUND));

        if (!chat.getStudent().getId().equals(studentId)) {
            throw new BusinessException("Practice does not belong to student");
        }

        if (chat.getStatus() != PracticeStatus.COMPLETED) {
            throw new BusinessException("Practice is not completed yet");
        }

        // Get all turns with answers
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

                // Collect errors
                if (answer.getEvaluation() != null && answer.getEvaluation().getErrors() != null) {
                    for (AIError error : answer.getEvaluation().getErrors()) {
                        String errorType = error.getErrorType().name();
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

        // Sort common errors by count descending
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

    // ===== GET PRACTICE CHAT =====
//    @Override
//    public PracticeChatResponse getPracticeChat(Long practiceId, Long userId) {
//        // Get student from userId
//        Student student = studentRepository
//                .findByUserId(userId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException("Không tìm thấy thông tin học viên")
//                );
//
//        Long studentId = student.getId();
//
//        AIPracticeChat chat = practiceChatRepository.findById(practiceId)
//                .orElseThrow(() -> new BusinessException(ErrorCode.PRACTICE_NOT_FOUND));
//
//        if (!chat.getStudent().getId().equals(studentId)) {
//            throw new BusinessException("Practice does not belong to student");
//        }
//
//        // Get current turn (chưa có answer)
//        AIPracticeTurn currentTurn = turnRepository
//                .findCurrentTurnByChatId(practiceId)
//                .orElse(null);
//
//        return buildPracticeChatResponse(chat, currentTurn);
//    }

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
                .map(e -> e.getErrorType().name())
                .collect(Collectors.toList());
    }

    private void updateStudentAIErrors(Long studentId, List<AIError> errors) {
        for (AIError error : errors) {
            String errorKey = generateErrorKey(error);

            StudentAIError studentError = studentAIErrorRepository
                    .findByStudentIdAndErrorKey(studentId, errorKey)
                    .orElse(null);

            if (studentError == null) {
                studentError = new StudentAIError();
                studentError.setStudent(studentRepository.getReferenceById(studentId));
                studentError.setErrorType(error.getErrorType());
                studentError.setErrorKey(errorKey);
                studentError.setOccurrenceCount(1);
                studentError.setCorrectedCount(0);
                studentError.setMasteryScore(0);
                studentError.setLastOccurredAt(LocalDateTime.now());
            } else {
                studentError.setOccurrenceCount(studentError.getOccurrenceCount() + 1);
                studentError.setLastOccurredAt(LocalDateTime.now());

                // Update mastery score: lower when error occurs
                int newMastery = Math.max(0, studentError.getMasteryScore() - 10);
                studentError.setMasteryScore(newMastery);
            }

            studentAIErrorRepository.save(studentError);
        }
    }

    private String generateErrorKey(AIError error) {
        String errorType = error.getErrorType().name();
        String corrected = error.getCorrectText()
                .replaceAll("[^a-zA-Z]", " ")
                .trim()
                .toUpperCase();

        // Lấy max 20 ký tự
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
        // Build better answers
        List<BetterAnswer> betterAnswers = new ArrayList<>();
        if (aiResponse.getBetterAnswers() != null) {
            for (String answer : aiResponse.getBetterAnswers()) {
                betterAnswers.add(BetterAnswer.builder()
                        .text(answer)
                        .description("Suggested improvement")
                        .build());
            }
        }

        // Build error details
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
}