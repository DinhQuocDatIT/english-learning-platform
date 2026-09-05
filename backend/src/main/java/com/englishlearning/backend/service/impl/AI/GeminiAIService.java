package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.constant.PromptConstants;  // ✅ Import
import com.englishlearning.backend.dto.request.AIEvaluateRequest;
import com.englishlearning.backend.dto.request.AIGenerateRequest;
import com.englishlearning.backend.dto.request.gemini.GeminiContent;
import com.englishlearning.backend.dto.request.gemini.GeminiPart;
import com.englishlearning.backend.dto.request.gemini.GeminiRequest;
import com.englishlearning.backend.dto.request.gemini.GenerationConfig;
import com.englishlearning.backend.dto.response.AIEvaluateResponse;
import com.englishlearning.backend.dto.response.AIGenerateResponse;
import com.englishlearning.backend.dto.response.AIErrorResponse;
import com.englishlearning.backend.dto.response.gemini.GeminiResponse;
import com.englishlearning.backend.dto.response.gemini.GeminiUsageMetadata;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ErrorCode;
import com.englishlearning.backend.service.AI.AIService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class GeminiAIService implements AIService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String geminiApiUrl;

    public GeminiAIService(RestTemplate restTemplate,
                           ObjectMapper objectMapper,
                           @Qualifier("geminiApiUrl") String geminiApiUrl) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.geminiApiUrl = geminiApiUrl;
    }

    @Override
    public AIGenerateResponse generateSentence(AIGenerateRequest request) {
        log.info("Đang tạo câu cho level: {}, topic: {}", request.getLevel(), request.getTopic());

        try {
            // ✅ Gọi prompt từ PromptConstants
            String vocabularyStr = request.getVocabularyWords() != null ?
                    String.join(", ", request.getVocabularyWords()) : null;
            String weaknessesStr = request.getWeaknesses() != null ?
                    String.join(", ", request.getWeaknesses()) : null;

            String prompt = PromptConstants.formatGeneratePrompt(
                    request.getLevel(),
                    request.getTopic(),
                    request.getSentenceType(),
                    vocabularyStr,
                    weaknessesStr
            );

            String response = callGeminiWithRetry(prompt, 3);
            return parseGenerateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi tạo câu: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    @Override
    public AIEvaluateResponse evaluateAnswer(AIEvaluateRequest request) {
        log.info("Đang đánh giá câu trả lời: {}", request.getVietnameseSentence());

        try {
            // ✅ Gọi prompt từ PromptConstants
            String prompt = PromptConstants.formatEvaluatePrompt(
                    request.getVietnameseSentence(),
                    request.getStudentAnswer(),
                    request.getExpectedAnswer(),
                    request.getLevel()
            );

            String response = callGeminiWithRetry(prompt, 3);
            return parseEvaluateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi đánh giá câu trả lời: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    @Override
    public AIEvaluateResponse evaluateAndGenerate(AIEvaluateRequest request) {
        log.info("Đang đánh giá và tạo câu hỏi tiếp theo");

        try {
            // ✅ Gọi prompt từ PromptConstants
            String vocabularyStr = request.getVocabularyWords() != null ?
                    String.join(", ", request.getVocabularyWords()) : null;
            String weaknessesStr = request.getWeaknesses() != null ?
                    String.join(", ", request.getWeaknesses()) : null;

            String prompt = PromptConstants.formatEvaluateAndGeneratePrompt(
                    request.getVietnameseSentence(),
                    request.getStudentAnswer(),
                    request.getExpectedAnswer(),
                    request.getLevel(),
                    request.getTopic(),
                    vocabularyStr,
                    weaknessesStr
            );

            String response = callGeminiWithRetry(prompt, 3);
            return parseEvaluateAndGenerateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi đánh giá và tạo câu tiếp theo: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    // ===== REST METHODS =====
    private String callGemini(String prompt) {
        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(
                        GeminiContent.builder()
                                .parts(List.of(
                                        GeminiPart.builder()
                                                .text(prompt)
                                                .build()
                                ))
                                .role("user")
                                .build()
                ))
                .generationConfig(GenerationConfig.builder()
                        .temperature(0.1)
                        .maxOutputTokens(4096)
                        .responseMimeType("application/json")
                        .build())
                .build();

        try {
            GeminiResponse response = restTemplate.postForObject(geminiApiUrl, request, GeminiResponse.class);

            if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
                log.error("Gemini response is null or empty");
                throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
            }

            String text = response.getCandidates().get(0).getContent().getParts().get(0).getText();

            GeminiUsageMetadata usage = response.getUsageMetadata();
            if (usage != null) {
                log.info("Gemini tokens - Input: {}, Output: {}, Total: {}",
                        usage.getPromptTokenCount(),
                        usage.getCandidatesTokenCount(),
                        usage.getTotalTokenCount());
            }

            return text;
        } catch (Exception e) {
            log.error("Lỗi gọi Gemini API: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    // ===== PARSE METHODS =====
    private AIGenerateResponse parseGenerateResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            return AIGenerateResponse.builder()
                    .vietnameseSentence(root.path("vietnameseSentence").asText())
                    .expectedAnswer(root.path("expectedAnswer").asText())
                    .sentenceType(root.path("sentenceType").asText())
                    .build();
        } catch (Exception e) {
            log.error("Lỗi parse phản hồi generate: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    private AIEvaluateResponse parseEvaluateResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            return parseEvaluateResponseRoot(root);
        } catch (Exception e) {
            log.error("Lỗi parse phản hồi evaluate: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    private AIEvaluateResponse parseEvaluateAndGenerateResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            AIEvaluateResponse evaluateResponse = parseEvaluateResponseRoot(root);

            JsonNode nextQuestion = root.path("nextQuestion");
            if (!nextQuestion.isMissingNode()) {
                AIGenerateResponse next = AIGenerateResponse.builder()
                        .vietnameseSentence(nextQuestion.path("vietnameseSentence").asText())
                        .expectedAnswer(nextQuestion.path("expectedAnswer").asText())
                        .sentenceType(nextQuestion.path("sentenceType").asText())
                        .build();
                evaluateResponse.setNextQuestion(next);
            }

            return evaluateResponse;
        } catch (Exception e) {
            log.error("Lỗi parse phản hồi evaluate and generate: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    private AIEvaluateResponse parseEvaluateResponseRoot(JsonNode root) {
        boolean isCorrect = root.path("isCorrect").asBoolean(false);
        int score = root.path("score").asInt(0);
        int naturalnessScore = root.path("naturalnessScore").asInt(50);
        String feedback = root.path("feedback").asText("Không có phản hồi.");

        score = Math.max(0, Math.min(100, score));
        naturalnessScore = Math.max(0, Math.min(100, naturalnessScore));

        if (!feedback.isEmpty() && !feedback.matches(".*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ].*")) {
            log.warn("⚠️ Feedback có thể không phải tiếng Việt: {}", feedback);
        }

        List<AIErrorResponse> errors = new ArrayList<>();
        JsonNode errorsNode = root.path("errors");
        if (errorsNode.isArray()) {
            for (JsonNode errorNode : errorsNode) {
                String errorType = errorNode.path("errorType").asText();
                String userText = errorNode.path("userText").asText();
                String correctText = errorNode.path("correctText").asText();
                String explanation = errorNode.path("explanation").asText();
                String severity = errorNode.path("severity").asText("MEDIUM");

                if (errorType == null || errorType.isEmpty() || explanation == null || explanation.isEmpty()) {
                    log.warn("⚠️ Bỏ qua error không hợp lệ: type={}, explanation={}", errorType, explanation);
                    continue;
                }

                errors.add(AIErrorResponse.builder()
                        .errorType(errorType)
                        .userText(userText != null ? userText : "")
                        .correctText(correctText != null ? correctText : "")
                        .explanation(explanation)
                        .severity(severity)
                        .build());
            }
        }

        List<String> betterAnswers = new ArrayList<>();
        JsonNode betterNode = root.path("betterAnswers");
        if (betterNode.isArray()) {
            for (JsonNode node : betterNode) {
                String answer = node.asText();
                if (answer != null && !answer.isEmpty()) {
                    betterAnswers.add(answer);
                }
            }
        }

        if (betterAnswers.isEmpty()) {
            String expected = root.path("expectedAnswer").asText();
            if (expected != null && !expected.isEmpty()) {
                betterAnswers.add(expected);
            }
        }

        return AIEvaluateResponse.builder()
                .isCorrect(isCorrect)
                .score(score)
                .naturalnessScore(naturalnessScore)
                .feedback(feedback)
                .betterAnswers(betterAnswers)
                .errors(errors)
                .build();
    }

    // ===== RETRY & FALLBACK =====
    private String callGeminiWithRetry(String prompt, int maxRetries) {
        int attempt = 0;
        String lastError = null;

        while (attempt < maxRetries) {
            try {
                String response = callGemini(prompt);

                try {
                    objectMapper.readTree(response);
                    log.info("✅ Gemini response successful after {} attempt(s)", attempt + 1);
                    return response;
                } catch (Exception e) {
                    log.warn("⚠️ Response không phải JSON hợp lệ, thử lại lần {}", attempt + 1);
                    lastError = "Invalid JSON response";
                    attempt++;
                }
            } catch (Exception e) {
                log.error("❌ Lỗi gọi Gemini, thử lại lần {}", attempt + 1, e);
                lastError = e.getMessage();
                attempt++;

                try {
                    Thread.sleep(1000 * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        log.error("❌ All {} retry attempts failed. Last error: {}", maxRetries, lastError);
        throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "AI service failed after " + maxRetries + " retries: " + lastError);
    }

    private AIEvaluateResponse createSafeFallbackResponse(AIEvaluateRequest request) {
        log.info("Tạo fallback response an toàn");

        String studentAnswer = request.getStudentAnswer().toLowerCase();
        String expectedAnswer = request.getExpectedAnswer().toLowerCase();

        studentAnswer = studentAnswer.replaceAll("[^a-zA-Z ]", "").trim();
        expectedAnswer = expectedAnswer.replaceAll("[^a-zA-Z ]", "").trim();

        String[] expectedWords = expectedAnswer.split(" ");
        int matchCount = 0;
        for (String word : expectedWords) {
            if (word.length() > 3 && studentAnswer.contains(word)) {
                matchCount++;
            }
        }

        double matchRatio = expectedWords.length > 0 ? (double) matchCount / expectedWords.length : 0;
        boolean isCorrect = matchRatio >= 0.6;
        int score = (int) Math.round(matchRatio * 100);

        String nextVietnamese = "Tôi thích học tiếng Anh.";
        String nextExpected = "I like learning English.";

        return AIEvaluateResponse.builder()
                .isCorrect(isCorrect)
                .score(score)
                .naturalnessScore(Math.min(score + 10, 100))
                .feedback(isCorrect ?
                        "✅ Câu trả lời của bạn tương đối tốt! Tiếp tục cố gắng nhé." :
                        "⚠️ Câu trả lời chưa chính xác. Hãy tham khảo đáp án gợi ý.")
                .betterAnswers(List.of(request.getExpectedAnswer()))
                .errors(new ArrayList<>())
                .nextQuestion(AIGenerateResponse.builder()
                        .vietnameseSentence(nextVietnamese)
                        .expectedAnswer(nextExpected)
                        .sentenceType("QUESTION")
                        .build())
                .build();
    }
}