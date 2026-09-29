package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarTopicEditRequest;
import com.englishlearning.backend.enums.GrammarEditRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrammarTopicEditRequestRepository
        extends JpaRepository<GrammarTopicEditRequest, Long> {

    // =====================================================
    // CHO TEACHER
    // =====================================================

    // Check xem topic có yêu cầu PENDING không
    boolean existsByTopicIdAndStatus(Long topicId, GrammarEditRequestStatus status);

    // Lấy yêu cầu PENDING mới nhất của topic
    Optional<GrammarTopicEditRequest> findFirstByTopicIdAndStatusOrderByCreatedAtDesc(
            Long topicId, GrammarEditRequestStatus status);

    // Lịch sử yêu cầu của topic
    List<GrammarTopicEditRequest> findByTopicIdOrderByCreatedAtDesc(Long topicId);

    // =====================================================
    // CHO ADMIN
    // =====================================================

    // Danh sách yêu cầu theo status
    List<GrammarTopicEditRequest> findByStatusOrderByCreatedAtDesc(
            GrammarEditRequestStatus status);

    // Đếm số yêu cầu PENDING (cho badge sidebar)
    long countByStatus(GrammarEditRequestStatus status);
}