package com.englishlearning.backend.service.conversation.impl;

import com.englishlearning.backend.config.GeminiConfig;
import com.englishlearning.backend.constant.ConversationPromptConstants;
import com.englishlearning.backend.dto.conversation.request.CreateChatRequest;
import com.englishlearning.backend.dto.conversation.request.SendChatMessageRequest;
import com.englishlearning.backend.dto.conversation.response.*;
import com.englishlearning.backend.dto.response.gemini.GeminiUsageMetadata;
import com.englishlearning.backend.entity.AIModelPricing;
import com.englishlearning.backend.entity.AIUsage;
import com.englishlearning.backend.entity.ChatConversation;
import com.englishlearning.backend.entity.ChatMessage;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.enums.AIFeature;
import com.englishlearning.backend.enums.ChatLevel;
import com.englishlearning.backend.enums.ChatStatus;
import com.englishlearning.backend.enums.RequestType;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.AIUsageRepository;
import com.englishlearning.backend.repository.ChatConversationRepository;
import com.englishlearning.backend.repository.ChatMessageRepository;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.service.PricingService;
import com.englishlearning.backend.service.StudentMembershipService;
import com.englishlearning.backend.service.StreakService;
import com.englishlearning.backend.service.conversation.ChatConversationService;
import com.englishlearning.backend.service.conversation.ConversationGeminiClient;
import com.englishlearning.backend.util.CorrectionFixer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChatConversationServiceImpl implements ChatConversationService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final StudentRepository studentRepository;
    private final ConversationGeminiClient conversationGeminiClient;
    private final StudentMembershipService studentMembershipService;
    private final StreakService streakService;
    private final ObjectMapper objectMapper;

    // ✅ NEW: tracking AIUsage
    private final AIUsageRepository aiUsageRepository;
    private final PricingService pricingService;
    private final GeminiConfig geminiConfig;

    // ========================================
    // 1. CREATE CONVERSATION
    // ========================================
    @Override
    public ChatConversationResponse createConversation(Long userId, CreateChatRequest request) {
        log.info("Creating conversation for user: {}, level: {}", userId, request.getLevel());

        checkMembership(userId);

        ChatLevel level = parseLevel(request.getLevel());

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên"));

        conversationRepository.findByStudentIdAndStatus(student.getId(), ChatStatus.ACTIVE)
                .ifPresent(old -> {
                    old.setStatus(ChatStatus.ENDED);
                    old.setEndedAt(LocalDateTime.now());
                    conversationRepository.save(old);
                    log.info("Auto-ended old conversation: {}", old.getId());
                });

        ChatConversation conversation = new ChatConversation();
        conversation.setStudent(student);
        conversation.setLevel(level);
        conversation.setStatus(ChatStatus.ACTIVE);
        conversation.setMessageCount(0);
        conversationRepository.save(conversation);

        String userName = student.getUser().getFullName();
        if (userName == null || userName.isBlank()) {
            userName = "there";
        }

        ChatMessage welcome = new ChatMessage();
        welcome.setConversation(conversation);
        welcome.setRole("ASSISTANT");
        welcome.setContent(ConversationPromptConstants.getWelcomeMessage(userName).trim());
        welcome.setReplyTranslation(ConversationPromptConstants.getWelcomeMessageTranslation(userName).trim());
        welcome.setNextQuestion(ConversationPromptConstants.WELCOME_NEXT_QUESTION);
        welcome.setNextQuestionTranslation(ConversationPromptConstants.WELCOME_NEXT_QUESTION_TRANSLATION);
        welcome.setSuggestedAnswers(toJsonArray(ConversationPromptConstants.WELCOME_SUGGESTED_ANSWERS));
        welcome.setCorrectionJson(null);
        messageRepository.save(welcome);

        conversation.setMessageCount(1);
        conversationRepository.save(conversation);

        studentMembershipService.incrementAIRequestCount(userId);

        log.info("Conversation created: id={}, messageCount={}", conversation.getId(), conversation.getMessageCount());

        return buildConversationResponse(conversation, true);
    }

    // ========================================
    // 2. SEND MESSAGE
    // ========================================
    @Override
    public ChatMessageResponse sendMessage(Long userId, Long conversationId, SendChatMessageRequest request) {
        log.info("Sending message to conversation: {}, user: {}", conversationId, userId);

        checkMembership(userId);

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hội thoại"));

        if (!conversation.getStudent().getUser().getId().equals(userId)) {
            throw new BusinessException("Cuộc hội thoại không thuộc về bạn");
        }

        if (conversation.getStatus() != ChatStatus.ACTIVE) {
            throw new BusinessException("Cuộc hội thoại đã kết thúc");
        }

        ChatMessage userMsg = new ChatMessage();
        userMsg.setConversation(conversation);
        userMsg.setRole("USER");
        userMsg.setContent(request.getMessage().trim());
        messageRepository.save(userMsg);

        List<ChatMessage> history = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);

        List<ChatMessage> historyForPrompt = history.stream()
                .filter(m -> !m.getId().equals(userMsg.getId()))
                .collect(Collectors.toList());

        String historyText = buildHistoryText(historyForPrompt);

        String prompt = ConversationPromptConstants.buildChatPrompt(
                conversation.getLevel().name(),
                historyText,
                request.getMessage().trim()
        );

        // ✅ Đo thời gian + gọi AI
        long startTime = System.currentTimeMillis();
        String aiResponseJson = conversationGeminiClient.callGeminiWithRetry(prompt, 3);
        long responseTime = System.currentTimeMillis() - startTime;

        // ✅ Lấy usage metadata
        GeminiUsageMetadata usage = conversationGeminiClient.getCurrentUsage();
        String provider = geminiConfig.getProvider();
        String model = geminiConfig.getModel();

        JsonNode root = objectMapper.readTree(aiResponseJson);
        String reply = root.path("reply").asText("");
        String replyTranslation = root.path("replyTranslation").asText("");
        String nextQuestion = root.path("nextQuestion").asText("");
        String nextQuestionTranslation = root.path("nextQuestionTranslation").asText("");
        List<String> suggestedAnswers = parseStringList(root.path("suggestedAnswers"));
        ChatCorrection correction = parseCorrection(root.path("correction"));

        // Validation: Kiểm tra và fix correction nếu AI cắt bớt + Dọn rác
        correction = validateAndFixCorrection(correction, request.getMessage().trim());

        // ✅ STREAK: Gửi tin nhắn → tính chuỗi (không cần biết đúng/sai)
        Student student = conversation.getStudent();
        streakService.recordActivity(student);

        // ✅ XP: Nếu câu ĐÚNG (hoặc correction bị hủy do rác) → cộng XP dựa vào level
        int xpEarned = 0;
        boolean isCorrect = correction == null || !Boolean.TRUE.equals(correction.getHasError());
        if (isCorrect) {
            xpEarned = calculateChatXp(conversation.getLevel());
            if (xpEarned > 0) {
                student.addExperience(xpEarned);
                log.info("✅ Cộng {} XP cho student {} (level {}, câu đúng)",
                        xpEarned, student.getId(), conversation.getLevel());
            }
        } else {
            log.info("ℹ️ Không cộng XP (câu có lỗi), student {}", student.getId());
        }
        studentRepository.save(student);

        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setConversation(conversation);
        aiMsg.setRole("ASSISTANT");
        aiMsg.setContent(reply);
        aiMsg.setReplyTranslation(replyTranslation);
        aiMsg.setNextQuestion(nextQuestion);
        aiMsg.setNextQuestionTranslation(nextQuestionTranslation);
        aiMsg.setSuggestedAnswers(toJsonArray(suggestedAnswers));
        aiMsg.setCorrectionJson(correction != null && Boolean.TRUE.equals(correction.getHasError())
                ? toJson(correction) : null);
        messageRepository.save(aiMsg);

        conversation.setMessageCount(conversation.getMessageCount() + 2);
        conversationRepository.save(conversation);

        studentMembershipService.incrementAIRequestCount(userId);

        // ✅ NEW: Lưu AIUsage cho conversation
        saveChatAIUsage(student, conversation.getId(), provider, model, responseTime, usage);

        log.info("Message sent. conversationId={}, messageCount={}, xpEarned={}",
                conversationId, conversation.getMessageCount(), xpEarned);

        ChatMessageResponse response = buildMessageResponse(aiMsg, correction);
        response.setExperienceEarned(xpEarned);
        return response;
    }

    // ========================================
    // 3. GET CONVERSATION
    // ========================================
    @Override
    @Transactional(readOnly = true)
    public ChatConversationResponse getConversation(Long userId, Long conversationId) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hội thoại"));

        if (!conversation.getStudent().getUser().getId().equals(userId)) {
            throw new BusinessException("Cuộc hội thoại không thuộc về bạn");
        }

        return buildConversationResponse(conversation, true);
    }

    // ========================================
    // 4. GET HISTORY
    // ========================================
    @Override
    @Transactional(readOnly = true)
    public Page<ChatHistoryItem> getConversationHistory(Long userId, Pageable pageable) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên"));

        return conversationRepository
                .findByStudentIdOrderByStartedAtDesc(student.getId(), pageable)
                .map(this::buildHistoryItem);
    }

    // ========================================
    // 5. END CONVERSATION
    // ========================================
    @Override
    public ChatEndResponse endConversation(Long userId, Long conversationId) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hội thoại"));

        if (!conversation.getStudent().getUser().getId().equals(userId)) {
            throw new BusinessException("Cuộc hội thoại không thuộc về bạn");
        }

        if (conversation.getStatus() == ChatStatus.ENDED) {
            throw new BusinessException("Cuộc hội thoại đã kết thúc trước đó");
        }

        conversation.setStatus(ChatStatus.ENDED);
        conversation.setEndedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return buildEndResponse(conversation);
    }

    // ========================================
    // 6. GET MESSAGES
    // ========================================
    @Override
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getMessages(Long userId, Long conversationId, Pageable pageable) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hội thoại"));

        if (!conversation.getStudent().getUser().getId().equals(userId)) {
            throw new BusinessException("Cuộc hội thoại không thuộc về bạn");
        }

        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId, pageable)
                .map(m -> buildMessageResponse(m, parseCorrectionFromJson(m.getCorrectionJson())));
    }

    // ========================================
    // PRIVATE HELPERS
    // ========================================

    /**
     * ✅ NEW: Lưu AIUsage cho chat conversation.
     * Bọc try/catch để không làm hỏng flow chính nếu tracking lỗi.
     */
    private void saveChatAIUsage(Student student, Long conversationId,
                                 String provider, String model,
                                 long responseTimeMs, GeminiUsageMetadata usage) {
        try {
            AIUsage aiUsage = new AIUsage();
            aiUsage.setStudent(student);
            aiUsage.setFeature(AIFeature.CONVERSATION);
            aiUsage.setReferenceId(conversationId);
            aiUsage.setRequestType(RequestType.CHAT_MESSAGE);
            aiUsage.setProvider(provider);
            aiUsage.setModel(model);
            aiUsage.setResponseTimeMs((int) responseTimeMs);
            aiUsage.setSuccess(true);
            aiUsage.setErrorMessage(null);

            if (usage != null) {
                int input = usage.getPromptTokenCount() != null ? usage.getPromptTokenCount() : 0;
                int output = usage.getCandidatesTokenCount() != null ? usage.getCandidatesTokenCount() : 0;
                int total = usage.getTotalTokenCount() != null ? usage.getTotalTokenCount() : 0;

                aiUsage.setInputTokens(input);
                aiUsage.setOutputTokens(output);
                aiUsage.setTotalTokens(total);

                BigDecimal cost = pricingService.calculateCost(provider, model, input, output);
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

            aiUsageRepository.save(aiUsage);
            log.info("✅ Chat AIUsage saved. feature=CONVERSATION, ref={}, tokens={}, cost={}",
                    conversationId, aiUsage.getTotalTokens(), aiUsage.getEstimatedCost());
        } catch (Exception e) {
            log.error("❌ Lỗi lưu AIUsage cho chat conversation {}: {}",
                    conversationId, e.getMessage(), e);
        }
    }

    /**
     * Tính XP dựa vào level:
     * - BEGINNER: 5 XP
     * - INTERMEDIATE: 8 XP
     * - ADVANCED: 12 XP
     */
    private int calculateChatXp(ChatLevel level) {
        return switch (level) {
            case BEGINNER -> 5;
            case INTERMEDIATE -> 8;
            case ADVANCED -> 12;
        };
    }

    private void checkMembership(Long userId) {
        if (!studentMembershipService.hasActiveMembership(userId)) {
            throw new BusinessException("Chức năng Chat AI yêu cầu gói Premium. Vui lòng đăng ký để sử dụng!");
        }
        if (!studentMembershipService.canMakeAIRequest(userId)) {
            throw new BusinessException("Bạn đã hết lượt sử dụng AI hôm nay. Vui lòng quay lại vào ngày mai!");
        }
    }

    private ChatLevel parseLevel(String levelStr) {
        try {
            return ChatLevel.valueOf(levelStr.toUpperCase().trim());
        } catch (Exception e) {
            throw new BusinessException("Level không hợp lệ: " + levelStr);
        }
    }

    /**
     * ✅ ĐÃ NÂNG CẤP: Validate, Fix và DỌN RÁC correction từ AI.
     */
    private ChatCorrection validateAndFixCorrection(ChatCorrection correction, String userMessage) {
        if (correction == null || !Boolean.TRUE.equals(correction.getHasError())) {
            return correction;
        }

        String userOriginal = correction.getUserOriginal() != null
                ? correction.getUserOriginal().trim() : "";
        String fullMessage = userMessage.trim();

        // 1. Fix nếu AI cắt bớt câu
        boolean isTruncated = userOriginal.length() < fullMessage.length() * 0.8;
        if (isTruncated) {
            log.warn("⚠️ AI cắt bớt userOriginal. AI='{}', Full='{}'", userOriginal, fullMessage);
            correction.setUserOriginal(fullMessage);
            String fixedText = CorrectionFixer.fixCommonErrors(fullMessage);
            correction.setCorrectedText(fixedText);
            if (correction.getExplanations() == null || correction.getExplanations().isEmpty()) {
                correction.setExplanations(List.of("Câu đã được sửa lại (tự động)."));
            }
        }

        // 2. DỌN RÁC: Lọc bỏ các giải thích vô lý của AI
        if (correction.getExplanations() != null) {
            List<String> cleanExplanations = correction.getExplanations().stream()
                    .filter(exp -> {
                        if (exp == null || exp.isBlank()) return false;
                        String lower = exp.toLowerCase();
                        // Bỏ qua các lỗi bịa đặt về viết hoa / mạo từ vô lý
                        if (lower.contains("viết hoa") && !lower.contains("hòa hợp")) return false;
                        if (lower.contains("mạo từ 'the'") && !lower.contains("thiếu")) return false;
                        return true;
                    })
                    .collect(Collectors.toList());
            correction.setExplanations(cleanExplanations);
        }

        // 3. Nếu explanations rỗng -> HỦY BỎ CORRECTION (coi như không có lỗi)
        if (correction.getExplanations() == null || correction.getExplanations().isEmpty()) {
            log.info("🧹 Đã xóa correction rác (explanations rỗng)");
            return null;
        }

        // 4. Nếu câu gốc và câu sửa chỉ khác nhau mỗi chữ 'i' viết hoa -> HỦY BỎ
        String originalLower = correction.getUserOriginal().toLowerCase();
        String correctedLower = correction.getCorrectedText() != null ? correction.getCorrectedText().toLowerCase() : "";
        if (originalLower.equals(correctedLower)) {
            log.info("🧹 Đã xóa correction rác (chỉ khác biệt do viết hoa)");
            return null;
        }

        return correction;
    }

    private String buildHistoryText(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return "(Chưa có tin nhắn nào)";
        }
        int fromIndex = Math.max(0, history.size() - ConversationPromptConstants.MAX_HISTORY_MESSAGES);
        return history.subList(fromIndex, history.size()).stream()
                .map(m -> (m.getRole().equals("USER") ? "User: " : "Buddy: ") + m.getContent())
                .collect(Collectors.joining("\n"));
    }

    private List<String> parseStringList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node == null || !node.isArray()) return result;
        for (JsonNode item : node) {
            String s = item.asText("");
            if (!s.isBlank()) result.add(s);
        }
        return result;
    }

    private ChatCorrection parseCorrection(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) return null;

        boolean hasError = node.path("hasError").asBoolean(false);
        if (!hasError) return null;

        String userOriginal = node.path("userOriginal").asText("");

        List<String> explanations = parseStringList(node.path("explanations"));

        if (explanations.isEmpty()) {
            String legacy = node.path("explanation").asText("");
            if (!legacy.isBlank()) {
                explanations = parseLegacyExplanation(legacy);
            }
        }

        explanations = filterMinorExplanations(explanations);
        validateExplanations(explanations, userOriginal);

        return ChatCorrection.builder()
                .hasError(true)
                .userOriginal(userOriginal)
                .correctedText(node.path("correctedText").asText(""))
                .explanations(explanations)
                .grammarNotes(parseStringList(node.path("grammarNotes")))
                .build();
    }

    private List<String> filterMinorExplanations(List<String> explanations) {
        if (explanations == null || explanations.isEmpty()) return new ArrayList<>();

        return explanations.stream()
                .filter(exp -> {
                    if (exp == null || exp.isBlank()) return false;
                    String lower = exp.toLowerCase();

                    if (lower.contains("dấu cách")) return false;
                    if (lower.contains("khoảng trắng")) return false;

                    if (lower.contains("viết hoa")
                            && !lower.contains("hòa hợp")
                            && !lower.contains("thì")
                            && !lower.contains("ngôi")) {
                        return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    private void validateExplanations(List<String> explanations, String userOriginal) {
        if (explanations == null || explanations.isEmpty()
                || userOriginal == null || userOriginal.isBlank()) {
            return;
        }

        String lowerUser = userOriginal.toLowerCase();
        Pattern pattern = Pattern.compile("'([^']+)'");

        for (String exp : explanations) {
            Matcher matcher = pattern.matcher(exp);
            while (matcher.find()) {
                String quoted = matcher.group(1).toLowerCase().trim();
                String cleaned = quoted.replaceAll("[.!?,;:]", "").trim();

                if (!cleaned.isBlank() && !cleaned.contains(" ")) {
                    if (!lowerUser.contains(cleaned)) {
                        log.warn("⚠️ AI có thể bịa từ: '{}' không có trong câu user: '{}'",
                                cleaned, userOriginal);
                    }
                }
            }
        }
    }

    private List<String> parseLegacyExplanation(String legacy) {
        List<String> result = new ArrayList<>();
        if (legacy == null || legacy.isBlank()) return result;

        String cleaned = legacy
                .replaceAll("(?i)^Có \\d+ lỗi:?\\s*", "")
                .trim();

        String[] parts = cleaned.split("(?=\\(\\d+\\))");
        for (String part : parts) {
            String p = part.replaceAll("^\\(\\d+\\)\\s*", "").trim();
            if (!p.isEmpty()) result.add(p);
        }

        return result;
    }

    private ChatCorrection parseCorrectionFromJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, ChatCorrection.class);
        } catch (Exception e) {
            log.warn("Lỗi parse correctionJson: {}", e.getMessage());
            return null;
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }

    private String toJsonArray(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private ChatConversationResponse buildConversationResponse(ChatConversation c, boolean includeMessages) {
        List<ChatMessageResponse> messages = null;
        if (includeMessages) {
            messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId())
                    .stream()
                    .map(m -> buildMessageResponse(m, parseCorrectionFromJson(m.getCorrectionJson())))
                    .collect(Collectors.toList());
        }

        return ChatConversationResponse.builder()
                .id(c.getId())
                .level(c.getLevel().name())
                .levelDisplay(c.getLevel().getDisplayName() + " (" + c.getLevel().getDisplayNameVi() + ")")
                .status(c.getStatus().name())
                .messageCount(c.getMessageCount())
                .startedAt(c.getStartedAt())
                .endedAt(c.getEndedAt())
                .messages(messages)
                .build();
    }

    private ChatMessageResponse buildMessageResponse(ChatMessage m, ChatCorrection correction) {
        List<String> suggested = parseJsonArray(m.getSuggestedAnswers());
        return ChatMessageResponse.builder()
                .id(m.getId())
                .role(m.getRole())
                .content(m.getContent())
                .replyTranslation(m.getReplyTranslation())
                .nextQuestion(m.getNextQuestion())
                .nextQuestionTranslation(m.getNextQuestionTranslation())
                .suggestedAnswers(suggested.isEmpty() ? null : suggested)
                .correction(correction)
                .createdAt(m.getCreatedAt())
                .build();
    }

    private ChatHistoryItem buildHistoryItem(ChatConversation c) {
        String lastMessage = null;
        LocalDateTime lastMessageAt = null;
        var lastOpt = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(c.getId());
        if (lastOpt.isPresent()) {
            ChatMessage last = lastOpt.get();
            lastMessage = last.getContent();
            lastMessageAt = last.getCreatedAt();
        }

        return ChatHistoryItem.builder()
                .id(c.getId())
                .level(c.getLevel().name())
                .levelDisplay(c.getLevel().getDisplayName() + " (" + c.getLevel().getDisplayNameVi() + ")")
                .status(c.getStatus().name())
                .messageCount(c.getMessageCount())
                .startedAt(c.getStartedAt())
                .endedAt(c.getEndedAt())
                .lastMessage(lastMessage)
                .lastMessageAt(lastMessageAt)
                .build();
    }

    private ChatEndResponse buildEndResponse(ChatConversation c) {
        long durationMinutes = 0;
        if (c.getStartedAt() != null && c.getEndedAt() != null) {
            durationMinutes = Duration.between(c.getStartedAt(), c.getEndedAt()).toMinutes();
        }

        return ChatEndResponse.builder()
                .id(c.getId())
                .level(c.getLevel().name())
                .status(c.getStatus().name())
                .messageCount(c.getMessageCount())
                .startedAt(c.getStartedAt())
                .endedAt(c.getEndedAt())
                .durationMinutes(durationMinutes)
                .build();
    }
}