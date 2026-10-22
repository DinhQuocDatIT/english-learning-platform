package com.englishlearning.backend.service.conversation;

import com.englishlearning.backend.config.GeminiConfig;
import com.englishlearning.backend.dto.request.gemini.GeminiContent;
import com.englishlearning.backend.dto.request.gemini.GeminiPart;
import com.englishlearning.backend.dto.request.gemini.GeminiRequest;
import com.englishlearning.backend.dto.request.gemini.GenerationConfig;
import com.englishlearning.backend.dto.response.gemini.GeminiResponse;
import com.englishlearning.backend.dto.response.gemini.GeminiUsageMetadata;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Slf4j
@Component
public class ConversationGeminiClient {

    private final RestTemplate restTemplate;
    private final String geminiApiUrl;
    private final ObjectMapper objectMapper;
    private final ThreadLocal<GeminiUsageMetadata> currentUsage = new ThreadLocal<>();

    public ConversationGeminiClient(RestTemplate restTemplate,
                                    GeminiConfig geminiConfig,
                                    String geminiApiUrl,
                                    ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.geminiApiUrl = geminiApiUrl;
        this.objectMapper = objectMapper;
    }

    public GeminiUsageMetadata getCurrentUsage() {
        return currentUsage.get();
    }

    public String callGemini(String prompt) {
        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(
                        GeminiContent.builder()
                                .parts(List.of(
                                        GeminiPart.builder().text(prompt).build()
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

            GeminiUsageMetadata usage = response.getUsageMetadata();
            if (usage != null) {
                currentUsage.set(usage);
                log.info("✅ Conversation Gemini tokens - Input: {}, Output: {}, Total: {}",
                        usage.getPromptTokenCount(),
                        usage.getCandidatesTokenCount(),
                        usage.getTotalTokenCount());
            } else {
                log.warn("⚠️ No usage metadata from Gemini (conversation)");
            }

            return response.getCandidates().get(0).getContent().getParts().get(0).getText();

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi gọi Gemini API: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    public String callGeminiWithRetry(String prompt, int maxRetries) {
        int attempt = 0;
        String lastError = null;

        while (attempt < maxRetries) {
            try {
                String response = callGemini(prompt);

                try {
                    objectMapper.readTree(response);
                    log.info("✅ Gemini response OK after {} attempt(s)", attempt + 1);
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
}