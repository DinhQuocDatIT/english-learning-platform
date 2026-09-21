package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.config.GeminiConfig;
import com.englishlearning.backend.constant.PromptConstants;
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
    private final GeminiConfig geminiConfig;

    private final ThreadLocal<GeminiUsageMetadata> currentUsage = new ThreadLocal<>();

    public GeminiAIService(RestTemplate restTemplate,
                           ObjectMapper objectMapper,
                           String geminiApiUrl,
                           GeminiConfig geminiConfig) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.geminiApiUrl = geminiApiUrl;
        this.geminiConfig = geminiConfig;
    }

    public GeminiUsageMetadata getCurrentUsage() {
        return currentUsage.get();
    }

    public String getCurrentModel() {
        return geminiConfig.getModel();
    }

    public String getCurrentProvider() {
        return geminiConfig.getProvider();
    }

    // ========================================
    // GENERATE SENTENCE
    // ========================================
    @Override
    public AIGenerateResponse generateSentence(AIGenerateRequest request) {
        log.info("Đang tạo câu. level: {}, topic: {}, sentenceType: {}, forcedWords: {}",
                request.getLevel(), request.getTopic(), request.getSentenceType(),
                request.getForcedWords());

        try {
            String weaknessesStr = request.getWeaknesses() != null ?
                    String.join(", ", request.getWeaknesses()) : null;

            String prompt = PromptConstants.formatGeneratePrompt(
                    request.getLevel(),
                    request.getTopic(),
                    request.getSentenceType(),
                    weaknessesStr,
                    request.getPreviousSentences(),
                    request.getForcedWords()   // ✅ forcedWords (List)
            );

            String response = callGeminiWithRetry(prompt, 3);
            return parseGenerateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi tạo câu: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    // ========================================
    // EVALUATE ANSWER
    // ========================================
    @Override
    public AIEvaluateResponse evaluateAnswer(AIEvaluateRequest request) {
        log.info("Đang đánh giá câu trả lời: {}", request.getVietnameseSentence());

        try {
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

    // ========================================
    // EVALUATE AND GENERATE
    // ========================================
    @Override
    public AIEvaluateResponse evaluateAndGenerate(AIEvaluateRequest request) {
        log.info("Đang đánh giá và tạo câu tiếp theo. forcedWords: {}",
                request.getForcedWords());

        try {
            String weaknessesStr = formatWeaknesses(request.getWeaknesses());

            String prompt = PromptConstants.formatEvaluateAndGeneratePrompt(
                    request.getVietnameseSentence(),
                    request.getStudentAnswer(),
                    request.getExpectedAnswer(),
                    request.getLevel(),
                    request.getTopic(),
                    weaknessesStr,
                    request.getSentenceType(),
                    request.getPreviousSentences(),
                    request.getForcedWords()   // ✅ forcedWords (List)
            );

            log.info("📤 [EVALUATE_AND_GENERATE] forcedWords: {}",
                    request.getForcedWords());

            String response = callGeminiWithRetry(prompt, 3);
            return parseEvaluateAndGenerateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi đánh giá và tạo câu tiếp theo: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    // ========================================
    // REST METHODS
    // ========================================
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
                        .temperature(0.7)
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
                this.currentUsage.set(usage);
                log.info("✅ Gemini tokens - Input: {}, Output: {}, Total: {}",
                        usage.getPromptTokenCount(),
                        usage.getCandidatesTokenCount(),
                        usage.getTotalTokenCount());
            } else {
                log.warn("⚠️ No usage metadata from Gemini");
            }

            return text;
        } catch (Exception e) {
            log.error("Lỗi gọi Gemini API: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    // ========================================
    // PARSE METHODS
    // ========================================
    private AIGenerateResponse parseGenerateResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);

            List<String> usedVocab = new ArrayList<>();
            JsonNode usedNode = root.path("usedVocabulary");
            if (usedNode.isArray()) {
                for (JsonNode n : usedNode) {
                    String v = n.asText();
                    if (v != null && !v.isEmpty()) {
                        usedVocab.add(v.toLowerCase().trim());
                    }
                }
            }

            return AIGenerateResponse.builder()
                    .vietnameseSentence(root.path("vietnameseSentence").asText())
                    .expectedAnswer(root.path("expectedAnswer").asText())
                    .sentenceType(root.path("sentenceType").asText())
                    .usedVocabulary(usedVocab)
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
            if (!nextQuestion.isMissingNode() && !nextQuestion.isNull()) {

                List<String> usedVocab = new ArrayList<>();
                JsonNode usedNode = nextQuestion.path("usedVocabulary");
                if (usedNode.isArray()) {
                    for (JsonNode n : usedNode) {
                        String v = n.asText();
                        if (v != null && !v.isEmpty()) {
                            usedVocab.add(v.toLowerCase().trim());
                        }
                    }
                }

                AIGenerateResponse next = AIGenerateResponse.builder()
                        .vietnameseSentence(nextQuestion.path("vietnameseSentence").asText())
                        .expectedAnswer(nextQuestion.path("expectedAnswer").asText())
                        .sentenceType(nextQuestion.path("sentenceType").asText())
                        .usedVocabulary(usedVocab)
                        .build();
                evaluateResponse.setNextQuestion(next);

                log.info("✅ Next question parsed. usedVocabulary: {}", usedVocab);
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

        List<AIErrorResponse> errors = new ArrayList<>();
        JsonNode errorsNode = root.path("errors");
        if (errorsNode.isArray()) {
            for (JsonNode errorNode : errorsNode) {
                String errorType = errorNode.path("errorType").asText();
                String errorCategory = errorNode.path("errorCategory").asText();
                String errorSubtype = errorNode.path("errorSubtype").asText();
                String userText = errorNode.path("userText").asText();
                String correctText = errorNode.path("correctText").asText();
                String explanation = errorNode.path("explanation").asText();
                String severity = errorNode.path("severity").asText("MEDIUM");

                if (errorType == null || errorType.isEmpty() || explanation == null || explanation.isEmpty()) {
                    log.warn("⚠️ Bỏ qua error không hợp lệ: type={}, explanation={}", errorType, explanation);
                    continue;
                }

                if (errorCategory == null || errorCategory.isEmpty()) {
                    errorCategory = errorType;
                }
                if (errorSubtype == null || errorSubtype.isEmpty()) {
                    errorSubtype = "MIXED_TENSE";
                }

                errors.add(AIErrorResponse.builder()
                        .errorType(errorType)
                        .errorCategory(errorCategory)
                        .errorSubtype(errorSubtype)
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

    // ========================================
    // RETRY & FALLBACK
    // ========================================
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
                    Thread.sleep(1000L * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        log.error("❌ All {} retry attempts failed. Last error: {}", maxRetries, lastError);
        throw new BusinessException(ErrorCode.AI_SERVICE_ERROR,
                "AI service failed after " + maxRetries + " retries: " + lastError);
    }

    private String formatWeaknesses(List<String> weaknesses) {
        if (weaknesses == null || weaknesses.isEmpty()) {
            return "Không có";
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < weaknesses.size(); i++) {
            sb.append(i + 1).append(". ").append(weaknesses.get(i));
            if (i == 0) {
                sb.append(" ← ƯU TIÊN");
            }
            if (i < weaknesses.size() - 1) {
                sb.append("\n");
            }
        }
        return sb.toString();
    }
}