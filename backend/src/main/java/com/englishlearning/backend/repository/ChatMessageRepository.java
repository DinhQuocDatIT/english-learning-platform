package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    Page<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId, Pageable pageable);

    Optional<ChatMessage> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    long countByConversationId(Long conversationId);
    // ===== đếm tin nhắn USER của student =====
    @Query("""
        SELECT COUNT(m) FROM ChatMessage m
        JOIN m.conversation c
        WHERE c.student.id = :studentId
          AND m.role = 'USER'
    """)
    long countUserMessagesByStudentId(@Param("studentId") Long studentId);

    // ===== ếm tin nhắn ASSISTANT có correction (câu user mắc lỗi) =====
    @Query("""
        SELECT COUNT(m) FROM ChatMessage m
        JOIN m.conversation c
        WHERE c.student.id = :studentId
          AND m.role = 'ASSISTANT'
          AND m.correctionJson IS NOT NULL
    """)
    long countErrorMessagesByStudentId(@Param("studentId") Long studentId);
}