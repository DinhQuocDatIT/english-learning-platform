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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChatConversationServiceImpl implements ChatConversationService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final StudentRepository studentRepository;
    private final ConversationGeminiClient conversationGeminiClient; // ✅ Đổi
    private final StudentMembershipService studentMembershipService;
    private final ObjectMapper objectMapper;

    // ========================================
    // 1. CREATE CONVERSATION
    // ========================================
    @Override
    public ChatConversationResponse createConversation(Long userId, CreateChatRequest request) {
        log.info("Creating conversation for user: {}, level: {}, topic: {}",
                userId, request.getLevel(), request.getTopic());

        // 1. Validate membership
        checkMembership(userId);

        // 2. Validate level & topic
        ChatLevel level = parseLevel(request.getLevel());
        String topic = request.getTopic();
        if (!ConversationPromptConstants.TOPIC_DESCRIPTION.containsKey(topic)) {
            throw new BusinessException("Topic không hợp lệ: " + topic);
        }

        // 3. Tìm student
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên"));

        // 4. Nếu có conversation ACTIVE → ENDED nó
        conversationRepository.findByStudentIdAndStatus(student.getId(), ChatStatus.ACTIVE)
                .ifPresent(old -> {
                    old.setStatus(ChatStatus.ENDED);
                    old.setEndedAt(LocalDateTime.now());
                    conversationRepository.save(old);
                    log.info("Auto-ended old conversation: {}", old.getId());
                });

        // 5. Tạo conversation mới
        ChatConversation conversation = new ChatConversation();
        conversation.setStudent(student);
        conversation.setLevel(level);
        conversation.setTopic(topic);
        conversation.setStatus(ChatStatus.ACTIVE);
        conversation.setMessageCount(0);
        conversationRepository.save(conversation);

        // 6. Tạo tin nhắn chào mừng (hardcode, không gọi Gemini)
        ChatMessage welcome = new ChatMessage();
        welcome.setConversation(conversation);
        welcome.setRole("ASSISTANT");
        welcome.setContent(ConversationPromptConstants.WELCOME_MESSAGE.trim());
        welcome.setReplyTranslation(ConversationPromptConstants.WELCOME_MESSAGE_TRANSLATION.trim());
        welcome.setNextQuestion(ConversationPromptConstants.WELCOME_NEXT_QUESTION);
        welcome.setNextQuestionTranslation(ConversationPromptConstants.WELCOME_NEXT_QUESTION_TRANSLATION);
        welcome.setSuggestedAnswers(toJsonArray(ConversationPromptConstants.WELCOME_SUGGESTED_ANSWERS));
        welcome.setCorrectionJson(null);
        messageRepository.save(welcome);

        // 7. Cập nhật messageCount
        conversation.setMessageCount(1);
        conversationRepository.save(conversation);

        // 8. Tăng request count
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

        // 1. Validate membership
        checkMembership(userId);

        // 2. Tìm conversation + check quyền
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hội thoại"));

        if (!conversation.getStudent().getUser().getId().equals(userId)) {
            throw new BusinessException("Cuộc hội thoại không thuộc về bạn");
        }

        if (conversation.getStatus() != ChatStatus.ACTIVE) {
            throw new BusinessException("Cuộc hội thoại đã kết thúc");
        }

        // 3. Lưu tin nhắn user
        ChatMessage userMsg = new ChatMessage();
        userMsg.setConversation(conversation);
        userMsg.setRole("USER");
        userMsg.setContent(request.getMessage().trim());
        messageRepository.save(userMsg);

        // 4. Lấy history (N tin nhắn gần nhất, KHÔNG tính tin nhắn user vừa lưu)
        List<ChatMessage> history = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Bỏ tin nhắn user vừa lưu ra khỏi history (vì nó sẽ được đưa riêng vào prompt)
        List<ChatMessage> historyForPrompt = history.stream()
                .filter(m -> !m.getId().equals(userMsg.getId()))
                .collect(Collectors.toList());

        String historyText = buildHistoryText(historyForPrompt);

        // 5. Build prompt + gọi Gemini
        String prompt = ConversationPromptConstants.buildChatPrompt(
                conversation.getLevel().name(),
                conversation.getTopic(),
                historyText,
                request.getMessage().trim()
        );

        String aiResponseJson = conversationGeminiClient.callGeminiWithRetry(prompt, 3); // ✅ Đổi

        // 6. Parse JSON
        JsonNode root = objectMapper.readTree(aiResponseJson);
        String reply = root.path("reply").asText("");
        String replyTranslation = root.path("replyTranslation").asText("");
        String nextQuestion = root.path("nextQuestion").asText("");
        String nextQuestionTranslation = root.path("nextQuestionTranslation").asText("");
        List<String> suggestedAnswers = parseStringList(root.path("suggestedAnswers"));
        ChatCorrection correction = parseCorrection(root.path("correction"));

        // 7. Lưu tin nhắn AI
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

        // 8. Cập nhật messageCount (+2 vì có 1 user + 1 AI)
        conversation.setMessageCount(conversation.getMessageCount() + 2);
        conversationRepository.save(conversation);

        // 9. Tăng request count
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
    // 6. GET MESSAGES (phân trang)
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

        return ChatCorrection.builder()
                .hasError(true)
                .userOriginal(node.path("userOriginal").asText(""))
                .correctedText(node.path("correctedText").asText(""))
                .explanation(node.path("explanation").asText(""))
                .grammarNotes(parseStringList(node.path("grammarNotes")))
                .build();
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
                .topic(c.getTopic())
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
                .topic(c.getTopic())
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
                .topic(c.getTopic())
                .status(c.getStatus().name())
                .messageCount(c.getMessageCount())
                .startedAt(c.getStartedAt())
                .endedAt(c.getEndedAt())
                .durationMinutes(durationMinutes)
                .build();
    }
}