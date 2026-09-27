package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarTheory;
import com.englishlearning.backend.enums.GrammarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarTheoryRepository extends JpaRepository<GrammarTheory, Long> {

    // =====================================================
    // CHO HỌC SINH (chỉ thấy PUBLISHED)
    // =====================================================
    List<GrammarTheory> findByTopicIdAndStatusOrderByDisplayOrderAsc(
            Long topicId, GrammarStatus status);

    // =====================================================
    // CHO GIÁO VIÊN / ADMIN (thấy mọi status)
    // =====================================================
    List<GrammarTheory> findByTopicIdOrderByDisplayOrderAsc(Long topicId);

    List<GrammarTheory> findByTopicIdAndStatusInOrderByDisplayOrderAsc(
            Long topicId, List<GrammarStatus> statuses);

    // =====================================================
    // ĐẾM
    // =====================================================
    int countByTopicId(Long topicId);

    int countByTopicIdAndStatus(Long topicId, GrammarStatus status);
}