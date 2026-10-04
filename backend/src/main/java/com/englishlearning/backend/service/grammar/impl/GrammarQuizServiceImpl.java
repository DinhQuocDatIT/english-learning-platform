package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.request.GrammarQuizQuestionRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarQuizRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarQuizSaveAnswerRequest;
import com.englishlearning.backend.dto.grammar.response.*;
import com.englishlearning.backend.entity.*;
import com.englishlearning.backend.enums.GrammarQuizAttemptStatus;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.*;
import com.englishlearning.backend.service.grammar.GrammarQuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GrammarQuizServiceImpl implements GrammarQuizService {

    private final GrammarQuizRepository quizRepository;
    private final GrammarQuizQuestionRepository questionRepository;
    private final GrammarQuizAttemptRepository attemptRepository;
    private final GrammarTopicRepository topicRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    // =====================================================
    // PUBLIC — STUDENT LIST
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarQuizSummaryResponse> getPublishedQuizzes(Long topicId, Long userId) {
        List<GrammarQuiz> quizzes = quizRepository
                .findByTopicIdAndStatusOrderByDisplayOrderAsc(topicId, GrammarStatus.PUBLISHED);

        Student student = findStudentOrNull(userId);

        return quizzes.stream()
                .map(q -> toSummary(q, student))
                .collect(Collectors.toList());
    }

    // =====================================================
    // STUDENT — PLAY
    // =====================================================

    @Override
    public GrammarQuizAttemptResponse startOrResumeAttempt(Long userId, Long quizId) {
        Student student = findStudent(userId);
        GrammarQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề"));

        if (quiz.getStatus() != GrammarStatus.PUBLISHED) {
            throw new BusinessException("Đề này chưa được publish");
        }

        // ✅ Lấy attempt IN_PROGRESS mới nhất (chống trùng)
        List<GrammarQuizAttempt> inProgressList = attemptRepository
                .findByStudentIdAndQuizIdAndStatusOrderByIdDesc(
                        student.getId(), quizId, GrammarQuizAttemptStatus.IN_PROGRESS);

        GrammarQuizAttempt attempt;
        if (!inProgressList.isEmpty()) {
            attempt = inProgressList.get(0);

            // Dọn các attempt IN_PROGRESS cũ nếu có nhiều hơn 1
            if (inProgressList.size() > 1) {
                for (int i = 1; i < inProgressList.size(); i++) {
                    attemptRepository.delete(inProgressList.get(i));
                }
                log.info("🧹 Đã xoá {} attempt IN_PROGRESS trùng của student {} quiz {}",
                        inProgressList.size() - 1, student.getId(), quizId);
            }
        } else {
            GrammarQuizAttempt a = new GrammarQuizAttempt();
            a.setStudent(student);
            a.setQuiz(quiz);
            a.setAnswers("{}");
            a.setStatus(GrammarQuizAttemptStatus.IN_PROGRESS);
            attempt = attemptRepository.save(a);
        }

        return toAttemptResponse(attempt, quiz, false);
    }

    @Override
    public GrammarQuizAttemptResponse saveAnswer(Long userId, Long attemptId,
                                                 GrammarQuizSaveAnswerRequest request) {
        Student student = findStudent(userId);
        GrammarQuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt làm bài"));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new BusinessException("Bạn không có quyền thao tác lượt làm bài này");
        }
        if (attempt.getStatus() != GrammarQuizAttemptStatus.IN_PROGRESS) {
            throw new BusinessException("Lượt làm bài này đã nộp");
        }

        Map<String, String> answers = parseAnswersMap(attempt.getAnswers());
        answers.put(String.valueOf(request.getQuestionId()), request.getAnswer());
        attempt.setAnswers(serialize(answers));

        GrammarQuizAttempt saved = attemptRepository.save(attempt);
        return toAttemptResponse(saved, saved.getQuiz(), false);
    }

    @Override
    public GrammarQuizAttemptResponse submitAttempt(Long userId, Long attemptId) {
        Student student = findStudent(userId);
        GrammarQuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt làm bài"));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new BusinessException("Bạn không có quyền thao tác lượt làm bài này");
        }
        if (attempt.getStatus() != GrammarQuizAttemptStatus.IN_PROGRESS) {
            throw new BusinessException("Lượt làm bài này đã nộp rồi");
        }

        GrammarQuiz quiz = attempt.getQuiz();
        List<GrammarQuizQuestion> questions = questionRepository
                .findByQuizIdOrderByDisplayOrderAsc(quiz.getId());

        if (questions.isEmpty()) {
            throw new BusinessException("Đề này không có câu hỏi nào");
        }

        Map<String, String> answers = parseAnswersMap(attempt.getAnswers());

        int correct = 0;
        for (GrammarQuizQuestion q : questions) {
            String userAns = answers.get(String.valueOf(q.getId()));
            if (userAns != null && userAns.equalsIgnoreCase(q.getCorrectAnswer())) {
                correct++;
            }
        }

        int total = questions.size();
        int score = (int) Math.round((correct * 100.0) / total);

        attempt.setCorrectCount(correct);
        attempt.setTotalQuestions(total);
        attempt.setScore(score);
        attempt.setStatus(GrammarQuizAttemptStatus.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());

        GrammarQuizAttempt saved = attemptRepository.save(attempt);

        log.info("📊 Student {} nộp bài quiz {} — {}/{} ({}%)",
                student.getId(), quiz.getId(), correct, total, score);

        return toAttemptResponse(saved, quiz, true);
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarQuizAttemptResponse getAttemptForQuiz(Long userId, Long quizId) {
        Student student = findStudent(userId);

        // ✅ List + get(0)
        List<GrammarQuizAttempt> inProgressList = attemptRepository
                .findByStudentIdAndQuizIdAndStatusOrderByIdDesc(
                        student.getId(), quizId, GrammarQuizAttemptStatus.IN_PROGRESS);

        if (!inProgressList.isEmpty()) {
            GrammarQuizAttempt attempt = inProgressList.get(0);
            return toAttemptResponse(attempt, attempt.getQuiz(), false);
        }

        List<GrammarQuizAttempt> completed = attemptRepository
                .findByStudentIdAndQuizIdAndStatusOrderByCompletedAtDesc(
                        student.getId(), quizId, GrammarQuizAttemptStatus.COMPLETED);
        if (completed.isEmpty()) {
            return null;
        }
        GrammarQuizAttempt latest = completed.get(0);
        return toAttemptResponse(latest, latest.getQuiz(), true);
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarQuizAttemptResponse getAttemptById(Long userId, Long attemptId) {
        Student student = findStudent(userId);
        GrammarQuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt làm bài"));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new BusinessException("Bạn không có quyền xem lượt làm bài này");
        }

        boolean showAnswer = attempt.getStatus() == GrammarQuizAttemptStatus.COMPLETED;
        return toAttemptResponse(attempt, attempt.getQuiz(), showAnswer);
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarQuizResponse getQuizForPlay(Long quizId) {
        GrammarQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề"));

        if (quiz.getStatus() != GrammarStatus.PUBLISHED) {
            throw new BusinessException("Đề này chưa được publish");
        }

        return toQuizResponse(quiz, false);
    }

    // =====================================================
    // TEACHER
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarQuizSummaryResponse> getQuizzesForEdit(Long teacherId, Long topicId) {
        GrammarTopic topic = findTopicAndCheckOwner(teacherId, topicId);
        return quizRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId())
                .stream()
                .map(q -> toSummary(q, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarQuizResponse getQuizForEdit(Long teacherId, Long quizId) {
        GrammarQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề"));

        if (!quiz.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền xem đề này");
        }

        return toQuizResponse(quiz, true);
    }

    @Override
    public GrammarQuizResponse createQuiz(Long teacherId, GrammarQuizRequest request) {
        GrammarTopic topic = findTopicAndCheckOwner(teacherId, request.getTopicId());

        if (topic.getStatus() != GrammarStatus.DRAFT
                && topic.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException(
                    "Chỉ có thể thêm đề khi chủ điểm ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        GrammarQuiz quiz = new GrammarQuiz();
        quiz.setTopic(topic);
        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription());
        quiz.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        quiz.setStatus(GrammarStatus.DRAFT);

        GrammarQuiz saved = quizRepository.save(quiz);

        saveQuestions(saved, request.getQuestions());

        GrammarQuiz reloaded = quizRepository.findById(saved.getId()).orElse(saved);
        return toQuizResponse(reloaded, true);
    }

    @Override
    public GrammarQuizResponse updateQuiz(Long teacherId, Long quizId, GrammarQuizRequest request) {
        GrammarQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề"));

        if (!quiz.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền sửa đề này");
        }
        if (quiz.getStatus() != GrammarStatus.DRAFT
                && quiz.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException(
                    "Chỉ có thể sửa đề ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) quiz.setDisplayOrder(request.getDisplayOrder());
        quizRepository.save(quiz);

        questionRepository.deleteAllByQuizId(quizId);
        saveQuestions(quiz, request.getQuestions());

        GrammarQuiz reloaded = quizRepository.findById(quizId).orElse(quiz);
        return toQuizResponse(reloaded, true);
    }

    @Override
    public void deleteQuiz(Long teacherId, Long quizId) {
        GrammarQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề"));

        if (!quiz.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền xóa đề này");
        }
        if (quiz.getStatus() != GrammarStatus.DRAFT) {
            throw new BusinessException("Chỉ có thể xóa đề ở trạng thái NHÁP");
        }

        quizRepository.delete(quiz);
    }

    // =====================================================
    // ADMIN
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarQuizSummaryResponse> getQuizzesForAdmin(Long topicId) {
        return quizRepository.findByTopicIdOrderByDisplayOrderAsc(topicId)
                .stream()
                .map(q -> toSummary(q, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarQuizResponse getQuizForAdmin(Long quizId) {
        GrammarQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề"));
        return toQuizResponse(quiz, true);
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private GrammarTopic findTopicAndCheckOwner(Long teacherId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));
        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền thao tác trên chủ điểm này");
        }
        return topic;
    }

    private Student findStudent(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông tin học viên"));
    }

    private Student findStudentOrNull(Long userId) {
        if (userId == null) return null;
        return studentRepository.findByUserId(userId).orElse(null);
    }

    private void saveQuestions(GrammarQuiz quiz, List<GrammarQuizQuestionRequest> requests) {
        if (requests == null || requests.isEmpty()) return;

        int order = 1;
        List<GrammarQuizQuestion> questions = new ArrayList<>();

        for (GrammarQuizQuestionRequest req : requests) {
            if (req.getOptions() == null || req.getOptions().size() != 4) {
                throw new BusinessException("Câu hỏi phải có đúng 4 đáp án");
            }

            GrammarQuizQuestion q = new GrammarQuizQuestion();
            q.setQuiz(quiz);
            q.setQuestion(req.getQuestion().trim());
            q.setOptions(serialize(req.getOptions()));
            q.setCorrectAnswer(req.getCorrectAnswer());
            q.setExplanation(req.getExplanation());

            if (req.getOptionExplanations() != null && !req.getOptionExplanations().isEmpty()) {
                Map<String, String> cleaned = new HashMap<>();
                req.getOptionExplanations().forEach((k, v) -> {
                    if (v != null && !v.isBlank()) cleaned.put(k, v.trim());
                });
                if (!cleaned.isEmpty()) {
                    q.setOptionExplanations(serialize(cleaned));
                }
            }

            q.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : order++);
            questions.add(q);
        }

        questionRepository.saveAll(questions);
    }

    private Map<String, String> parseAnswersMap(String json) {
        if (json == null || json.isBlank()) return new HashMap<>();
        try {
            JsonNode node = objectMapper.readTree(json);
            Map<String, String> result = new HashMap<>();
            node.properties().forEach(entry ->
                    result.put(entry.getKey(), entry.getValue().asText()));
            return result;
        } catch (Exception e) {
            log.warn("Lỗi parse attempt answers: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    private List<String> parseOptions(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            JsonNode node = objectMapper.readTree(json);
            List<String> result = new ArrayList<>();
            if (node.isArray()) node.forEach(n -> result.add(n.asText()));
            return result;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private Map<String, String> parseStringMap(String json) {
        if (json == null || json.isBlank()) return new HashMap<>();
        try {
            JsonNode node = objectMapper.readTree(json);
            Map<String, String> result = new HashMap<>();
            node.properties().forEach(entry ->
                    result.put(entry.getKey(), entry.getValue().asText()));
            return result;
        } catch (Exception e) {
            log.warn("Lỗi parse option explanations: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    private String serialize(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Lỗi serialize: {}", e.getMessage());
            return null;
        }
    }

    // =====================================================
    // MAPPERS
    // =====================================================

    private GrammarQuizSummaryResponse toSummary(GrammarQuiz q, Student student) {
        int totalQuestions = questionRepository.countByQuizId(q.getId());

        GrammarQuizSummaryResponse.GrammarQuizSummaryResponseBuilder b =
                GrammarQuizSummaryResponse.builder()
                        .id(q.getId())
                        .topicId(q.getTopic().getId())
                        .title(q.getTitle())
                        .description(q.getDescription())
                        .displayOrder(q.getDisplayOrder())
                        .status(q.getStatus().name())
                        .totalQuestions(totalQuestions);

        if (student != null) {
            // ✅ List + isEmpty
            List<GrammarQuizAttempt> inProgressList = attemptRepository
                    .findByStudentIdAndQuizIdAndStatusOrderByIdDesc(
                            student.getId(), q.getId(), GrammarQuizAttemptStatus.IN_PROGRESS);
            b.hasInProgressAttempt(!inProgressList.isEmpty());

            List<GrammarQuizAttempt> completed = attemptRepository
                    .findByStudentIdAndQuizIdAndStatusOrderByCompletedAtDesc(
                            student.getId(), q.getId(), GrammarQuizAttemptStatus.COMPLETED);
            b.attemptCount(completed.size());

            if (!completed.isEmpty()) {
                int best = completed.stream()
                        .mapToInt(a -> a.getScore() != null ? a.getScore() : 0)
                        .max().orElse(0);
                b.bestScore(best);
                b.latestScore(completed.get(0).getScore());
            } else {
                b.bestScore(null);
                b.latestScore(null);
            }
        } else {
            b.hasInProgressAttempt(false)
                    .attemptCount(0)
                    .bestScore(null)
                    .latestScore(null);
        }

        return b.build();
    }

    private GrammarQuizResponse toQuizResponse(GrammarQuiz q, boolean showAnswers) {
        List<GrammarQuizQuestion> questions = questionRepository
                .findByQuizIdOrderByDisplayOrderAsc(q.getId());

        List<GrammarQuizQuestionResponse> questionDtos = questions.stream()
                .map(qu -> GrammarQuizQuestionResponse.builder()
                        .id(qu.getId())
                        .question(qu.getQuestion())
                        .options(parseOptions(qu.getOptions()))
                        .displayOrder(qu.getDisplayOrder())
                        .correctAnswer(showAnswers ? qu.getCorrectAnswer() : null)
                        .explanation(showAnswers ? qu.getExplanation() : null)
                        .optionExplanations(showAnswers
                                ? parseStringMap(qu.getOptionExplanations())
                                : null)
                        .build())
                .collect(Collectors.toList());

        return GrammarQuizResponse.builder()
                .id(q.getId())
                .topicId(q.getTopic().getId())
                .title(q.getTitle())
                .description(q.getDescription())
                .displayOrder(q.getDisplayOrder())
                .status(q.getStatus().name())
                .totalQuestions(questionDtos.size())
                .questions(questionDtos)
                .build();
    }

    private GrammarQuizAttemptResponse toAttemptResponse(GrammarQuizAttempt attempt,
                                                         GrammarQuiz quiz,
                                                         boolean showAnswers) {
        Map<String, String> answersMap = parseAnswersMap(attempt.getAnswers());
        Map<Long, String> answers = new HashMap<>();
        answersMap.forEach((k, v) -> {
            try { answers.put(Long.parseLong(k), v); } catch (NumberFormatException ignored) {}
        });

        GrammarQuizResponse quizDetail = toQuizResponse(quiz, showAnswers);

        return GrammarQuizAttemptResponse.builder()
                .id(attempt.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .status(attempt.getStatus().name())
                .answers(answers)
                .correctCount(attempt.getCorrectCount())
                .totalQuestions(attempt.getTotalQuestions())
                .score(attempt.getScore())
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .quiz(quizDetail)
                .build();
    }
}