package com.englishlearning.backend.controller.conversation;

import com.englishlearning.backend.dto.conversation.request.CreateChatRequest;
import com.englishlearning.backend.dto.conversation.request.SendChatMessageRequest;
import com.englishlearning.backend.dto.conversation.response.ChatConversationResponse;
import com.englishlearning.backend.dto.conversation.response.ChatEndResponse;
import com.englishlearning.backend.dto.conversation.response.ChatHistoryItem;
import com.englishlearning.backend.dto.conversation.response.ChatMessageResponse;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.conversation.ChatConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai/conversation")
@RequiredArgsConstructor
public class ChatConversationController {

    private final ChatConversationService chatService;

    // ========================================
    // 1. CREATE CONVERSATION
    // ========================================
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ChatConversationResponse>> createConversation(
            @Valid @RequestBody CreateChatRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Creating conversation for user: {}", userId);

        ChatConversationResponse response = chatService.createConversation(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Tạo cuộc hội thoại thành công", response));
    }

    // ========================================
    // 2. SEND MESSAGE
    // ========================================
    @PostMapping("/{conversationId}/message")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendChatMessageRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Sending message to conversation: {}, user: {}", conversationId, userId);

        ChatMessageResponse response = chatService.sendMessage(userId, conversationId, request);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Gửi tin nhắn thành công", response)
        );
    }

    // ========================================
    // 3. GET CONVERSATION DETAIL
    // ========================================
    @GetMapping("/{conversationId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ChatConversationResponse>> getConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting conversation: {}, user: {}", conversationId, userId);

        ChatConversationResponse response = chatService.getConversation(userId, conversationId);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy cuộc hội thoại thành công", response)
        );
    }

    // ========================================
    // 4. GET HISTORY (phân trang)
    // ========================================
    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Page<ChatHistoryItem>>> getHistory(
            @PageableDefault(size = 10, sort = "startedAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting conversation history for user: {}", userId);

        Page<ChatHistoryItem> response = chatService.getConversationHistory(userId, pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy lịch sử cuộc hội thoại thành công", response)
        );
    }

    // ========================================
    // 5. END CONVERSATION
    // ========================================
    @PostMapping("/{conversationId}/end")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ChatEndResponse>> endConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Ending conversation: {}, user: {}", conversationId, userId);

        ChatEndResponse response = chatService.endConversation(userId, conversationId);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Kết thúc cuộc hội thoại thành công", response)
        );
    }

    // ========================================
    // 6. GET MESSAGES (phân trang, load more)
    // ========================================
    @GetMapping("/{conversationId}/messages")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        log.info("Getting messages for conversation: {}, user: {}", conversationId, userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<ChatMessageResponse> response = chatService.getMessages(userId, conversationId, pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy tin nhắn thành công", response)
        );
    }
}