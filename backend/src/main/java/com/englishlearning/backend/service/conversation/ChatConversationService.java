package com.englishlearning.backend.service.conversation;

import com.englishlearning.backend.dto.conversation.request.CreateChatRequest;
import com.englishlearning.backend.dto.conversation.request.SendChatMessageRequest;
import com.englishlearning.backend.dto.conversation.response.ChatConversationResponse;
import com.englishlearning.backend.dto.conversation.response.ChatEndResponse;
import com.englishlearning.backend.dto.conversation.response.ChatHistoryItem;
import com.englishlearning.backend.dto.conversation.response.ChatMessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatConversationService {

    /**
     * Tạo cuộc hội thoại mới.
     * Nếu user đang có conversation ACTIVE → tự động ENDED conversation cũ.
     */
    ChatConversationResponse createConversation(Long userId, CreateChatRequest request);

    /**
     * Gửi tin nhắn và nhận phản hồi từ AI.
     */
    ChatMessageResponse sendMessage(Long userId, Long conversationId, SendChatMessageRequest request);

    /**
     * Lấy chi tiết cuộc hội thoại (kèm toàn bộ tin nhắn).
     */
    ChatConversationResponse getConversation(Long userId, Long conversationId);

    /**
     * Lấy lịch sử các cuộc hội thoại (phân trang, tóm tắt).
     */
    Page<ChatHistoryItem> getConversationHistory(Long userId, Pageable pageable);

    /**
     * Kết thúc cuộc hội thoại.
     */
    ChatEndResponse endConversation(Long userId, Long conversationId);

    /**
     * Lấy tin nhắn của cuộc hội thoại (phân trang, dùng cho load more).
     */
    Page<ChatMessageResponse> getMessages(Long userId, Long conversationId, Pageable pageable);
}