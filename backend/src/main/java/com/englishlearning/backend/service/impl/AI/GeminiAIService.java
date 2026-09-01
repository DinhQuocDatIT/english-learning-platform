package com.englishlearning.backend.service.impl.AI;

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
            String prompt = buildGeneratePrompt(request);
            String response = callGemini(prompt);
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
            String prompt = buildEvaluatePrompt(request);
            String response = callGemini(prompt);
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
            String prompt = buildEvaluateAndGeneratePrompt(request);
            String response = callGemini(prompt);
            return parseEvaluateAndGenerateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi đánh giá và tạo câu tiếp theo: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    // ===== PRIVATE METHODS =====

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
                        .temperature(0.3)
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

    private String buildGeneratePrompt(AIGenerateRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là một giáo viên tiếng Anh. Hãy tạo một câu tiếng Việt để học viên dịch sang tiếng Anh.\n\n");
        prompt.append("QUAN TRỌNG: Câu hỏi PHẢI được viết bằng tiếng Việt.\n\n");
        prompt.append("Trình độ học viên: ").append(request.getLevel()).append("\n");
        prompt.append("Loại câu: ").append(request.getSentenceType()).append("\n");
        prompt.append("Chủ đề: ").append(request.getTopic()).append("\n");

        if (request.getVocabularyWords() != null && !request.getVocabularyWords().isEmpty()) {
            prompt.append("Từ vựng cần bao gồm: ").append(String.join(", ", request.getVocabularyWords())).append("\n");
        }

        if (request.getWeaknesses() != null && !request.getWeaknesses().isEmpty()) {
            prompt.append("Điểm yếu của học viên cần tập trung: ").append(String.join(", ", request.getWeaknesses())).append("\n");
        }

        prompt.append("\nTrả về JSON theo định dạng sau:\n");
        prompt.append("{\n");
        prompt.append("  \"vietnameseSentence\": \"...\",\n");
        prompt.append("  \"expectedAnswer\": \"...\",\n");
        prompt.append("  \"sentenceType\": \"QUESTION\" hoặc \"ANSWER\"\n");
        prompt.append("}\n");
        prompt.append("\nChỉ trả về JSON, không có văn bản thừa.");

        return prompt.toString();
    }

    private String buildEvaluatePrompt(AIEvaluateRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là một giáo viên tiếng Anh. Hãy đánh giá bản dịch này.\n\n");
        prompt.append("QUAN TRỌNG: Tất cả phản hồi, giải thích và mô tả lỗi PHẢI được viết bằng tiếng Việt.\n\n");
        prompt.append("Câu tiếng Việt: ").append(request.getVietnameseSentence()).append("\n");
        prompt.append("Câu trả lời của học viên: ").append(request.getStudentAnswer()).append("\n");
        prompt.append("Câu trả lời kỳ vọng: ").append(request.getExpectedAnswer()).append("\n");
        prompt.append("Trình độ học viên: ").append(request.getLevel()).append("\n\n");

        prompt.append("Trả về JSON theo định dạng sau:\n");
        prompt.append("{\n");
        prompt.append("  \"isCorrect\": true/false,\n");
        prompt.append("  \"score\": 0-100,\n");
        prompt.append("  \"naturalnessScore\": 0-100,\n");
        prompt.append("  \"feedback\": \"...\",\n");
        prompt.append("  \"betterAnswers\": [\"...\"],\n");
        prompt.append("  \"errors\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"errorType\": \"GRAMMAR|VOCABULARY|ARTICLE|PREPOSITION|TENSE|WORD_ORDER|SPELLING|WORD_CHOICE|NATURALNESS|MISSING_WORD|EXTRA_WORD\",\n");
        prompt.append("      \"userText\": \"...\",\n");
        prompt.append("      \"correctText\": \"...\",\n");
        prompt.append("      \"explanation\": \"...\",\n");
        prompt.append("      \"severity\": \"HIGH|MEDIUM|LOW\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        prompt.append("\nChỉ trả về JSON, không có văn bản thừa.");

        return prompt.toString();
    }

    private String buildEvaluateAndGeneratePrompt(AIEvaluateRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là một giáo viên tiếng Anh. Hãy đánh giá bản dịch này và tạo câu hỏi tiếp theo.\n\n");
        prompt.append("QUAN TRỌNG: Tất cả phản hồi, giải thích và mô tả lỗi PHẢI được viết bằng tiếng Việt.\n\n");
        prompt.append("Câu tiếng Việt: ").append(request.getVietnameseSentence()).append("\n");
        prompt.append("Câu trả lời của học viên: ").append(request.getStudentAnswer()).append("\n");
        prompt.append("Câu trả lời kỳ vọng: ").append(request.getExpectedAnswer()).append("\n");
        prompt.append("Trình độ học viên: ").append(request.getLevel()).append("\n");
        prompt.append("Chủ đề: ").append(request.getTopic()).append("\n");

        if (request.getVocabularyWords() != null && !request.getVocabularyWords().isEmpty()) {
            prompt.append("Từ vựng cần bao gồm trong câu tiếp theo: ").append(String.join(", ", request.getVocabularyWords())).append("\n");
        }

        if (request.getWeaknesses() != null && !request.getWeaknesses().isEmpty()) {
            prompt.append("Điểm yếu của học viên cần tập trung: ").append(String.join(", ", request.getWeaknesses())).append("\n");
        }

        prompt.append("\nTrả về JSON theo định dạng sau:\n");
        prompt.append("{\n");
        prompt.append("  \"isCorrect\": true/false,\n");
        prompt.append("  \"score\": 0-100,\n");
        prompt.append("  \"naturalnessScore\": 0-100,\n");
        prompt.append("  \"feedback\": \"...\",\n");
        prompt.append("  \"betterAnswers\": [\"...\"],\n");
        prompt.append("  \"errors\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"errorType\": \"GRAMMAR|VOCABULARY|ARTICLE|PREPOSITION|TENSE|WORD_ORDER|SPELLING|WORD_CHOICE|NATURALNESS|MISSING_WORD|EXTRA_WORD\",\n");
        prompt.append("      \"userText\": \"...\",\n");
        prompt.append("      \"correctText\": \"...\",\n");
        prompt.append("      \"explanation\": \"...\",\n");
        prompt.append("      \"severity\": \"HIGH|MEDIUM|LOW\"\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"nextQuestion\": {\n");
        prompt.append("    \"vietnameseSentence\": \"...\",\n");
        prompt.append("    \"expectedAnswer\": \"...\",\n");
        prompt.append("    \"sentenceType\": \"QUESTION\" hoặc \"ANSWER\"\n");
        prompt.append("  }\n");
        prompt.append("}\n");
        prompt.append("\nChỉ trả về JSON, không có văn bản thừa.");

        return prompt.toString();
    }

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
        List<AIErrorResponse> errors = new ArrayList<>();
        JsonNode errorsNode = root.path("errors");
        if (errorsNode.isArray()) {
            for (JsonNode errorNode : errorsNode) {
                errors.add(AIErrorResponse.builder()
                        .errorType(errorNode.path("errorType").asText())
                        .userText(errorNode.path("userText").asText())
                        .correctText(errorNode.path("correctText").asText())
                        .explanation(errorNode.path("explanation").asText())
                        .severity(errorNode.path("severity").asText())
                        .build());
            }
        }

        List<String> betterAnswers = new ArrayList<>();
        JsonNode betterNode = root.path("betterAnswers");
        if (betterNode.isArray()) {
            for (JsonNode node : betterNode) {
                betterAnswers.add(node.asText());
            }
        }

        return AIEvaluateResponse.builder()
                .isCorrect(root.path("isCorrect").asBoolean())
                .score(root.path("score").asInt())
                .naturalnessScore(root.path("naturalnessScore").asInt())
                .feedback(root.path("feedback").asText())
                .betterAnswers(betterAnswers)
                .errors(errors)
                .build();
    }
}