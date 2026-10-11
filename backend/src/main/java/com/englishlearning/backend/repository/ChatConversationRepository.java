package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ChatConversation;
import com.englishlearning.backend.enums.ChatStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    Page<ChatConversation> findByStudentIdOrderByStartedAtDesc(Long studentId, Pageable pageable);

    Optional<ChatConversation> findByStudentIdAndStatus(Long studentId, ChatStatus status);

    long countByStudentId(Long studentId);
}