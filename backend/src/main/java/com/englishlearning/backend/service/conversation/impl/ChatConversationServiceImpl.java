package com.englishlearning.backend.service.conversation.impl;

import com.englishlearning.backend.constant.ConversationPromptConstants;
import com.englishlearning.backend.dto.conversation.request.CreateChatRequest;
import com.englishlearning.backend.dto.conversation.request.SendChatMessageRequest;
import com.englishlearning.backend.dto.conversation.response.*;
import com.englishlearning.backend.entity.ChatConversation;
import com.englishlearning.backend.entity.ChatMessage;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.enums.ChatLevel;
import com.englishlearning.backend.enums.ChatStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.ChatConversationRepository;
import com.englishlearning.backend.repository.ChatMessageRepository;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.service.StudentMembershipService;
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
    private final ObjectMapper objectMapper;

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

        String aiResponseJson = conversationGeminiClient.callGeminiWithRetry(prompt, 3);

        JsonNode root = objectMapper.readTree(aiResponseJson);
        String reply = root.path("reply").asText("");
        String replyTranslation = root.path("replyTranslation").asText("");
        String nextQuestion = root.path("nextQuestion").asText("");
        String nextQuestionTranslation = root.path("nextQuestionTranslation").asText("");
        List<String> suggestedAnswers = parseStringList(root.path("suggestedAnswers"));
        ChatCorrection correction = parseCorrection(root.path("correction"));

        // Validation: Kiểm tra và fix correction nếu AI cắt bớt
        correction = validateAndFixCorrection(correction, request.getMessage().trim());

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

        log.info("Message sent. conversationId={}, messageCount={}", conversationId, conversation.getMessageCount());

        return buildMessageResponse(aiMsg, correction);
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
     * Kiểm tra correction từ AI. Nếu AI cắt bớt (userOriginal < 80% tin nhắn gốc)
     * → override bằng tin nhắn gốc + tự sửa bằng regex.
     */
    private ChatCorrection validateAndFixCorrection(ChatCorrection correction, String userMessage) {
        if (correction == null || !Boolean.TRUE.equals(correction.getHasError())) {
            return correction;
        }

        String userOriginal = correction.getUserOriginal() != null
                ? correction.getUserOriginal().trim() : "";
        String fullMessage = userMessage.trim();

        boolean isTruncated = userOriginal.length() < fullMessage.length() * 0.8;

        if (isTruncated) {
            log.warn("⚠️ AI cắt bớt userOriginal. AI='{}', Full='{}'",
                    userOriginal, fullMessage);

            correction.setUserOriginal(fullMessage);

            String fixedText = CorrectionFixer.fixCommonErrors(fullMessage);
            correction.setCorrectedText(fixedText);

            if (correction.getExplanations() == null || correction.getExplanations().isEmpty()) {
                correction.setExplanations(List.of("Câu đã được sửa lại (tự động)."));
            }
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

        // Parse explanations array (fallback: nếu AI trả "explanation" string cũ → convert)
        List<String> explanations = parseStringList(node.path("explanations"));

        // Fallback: nếu AI trả "explanation" (string cũ) → parse thành array
        if (explanations.isEmpty()) {
            String legacy = node.path("explanation").asText("");
            if (!legacy.isBlank()) {
                explanations = parseLegacyExplanation(legacy);
            }
        }

        // ✅ Filter bỏ explanation nói về dấu cách / viết hoa
        explanations = filterMinorExplanations(explanations);

        // ✅ Validation: log warning nếu AI bịa từ
        validateExplanations(explanations, userOriginal);

        return ChatCorrection.builder()
                .hasError(true)
                .userOriginal(userOriginal)
                .correctedText(node.path("correctedText").asText(""))
                .explanations(explanations)
                .grammarNotes(parseStringList(node.path("grammarNotes")))
                .build();
    }

    /**
     * Filter bỏ các explanation nói về lỗi dấu cách / viết hoa.
     * Vì đây là lỗi nhỏ nhặt, không cần thiết hiển thị cho user.
     */
    private List<String> filterMinorExplanations(List<String> explanations) {
        if (explanations == null || explanations.isEmpty()) return new ArrayList<>();

        return explanations.stream()
                .filter(exp -> {
                    if (exp == null || exp.isBlank()) return false;
                    String lower = exp.toLowerCase();

                    // Bỏ nếu nói về dấu cách
                    if (lower.contains("dấu cách")) return false;
                    if (lower.contains("khoảng trắng")) return false;

                    // Bỏ nếu chỉ nói về viết hoa (không kèm ngữ pháp khác)
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

    /**
     * Kiểm tra các từ trong dấu '...' của explanations có khớp với câu user không.
     * Chỉ log warning để debug, không fix.
     */
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

                // Chỉ check nếu quoted là 1 từ đơn (không có space)
                if (!cleaned.isBlank() && !cleaned.contains(" ")) {
                    if (!lowerUser.contains(cleaned)) {
                        log.warn("⚠️ AI có thể bịa từ: '{}' không có trong câu user: '{}'",
                                cleaned, userOriginal);
                    }
                }
            }
        }
    }

    /**
     * Fallback: parse explanation string cũ "Có X lỗi: (1) ... (2) ..." thành array.
     */
    private List<String> parseLegacyExplanation(String legacy) {
        List<String> result = new ArrayList<>();
        if (legacy == null || legacy.isBlank()) return result;

        String cleaned = legacy
                .replaceAll("(?i)^Có \\d+ lỗi:?\\s*", "")
                .trim();

        // Split theo (1), (2), (3)...
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