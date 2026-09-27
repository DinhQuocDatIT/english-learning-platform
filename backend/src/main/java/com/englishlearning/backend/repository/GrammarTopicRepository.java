package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.enums.GrammarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrammarTopicRepository extends JpaRepository<GrammarTopic, Long> {

    // =====================================================
    // CHO HỌC SINH (chỉ thấy PUBLISHED)
    // =====================================================
    List<GrammarTopic> findByRoadmapIdAndStatusOrderByDisplayOrderAsc(
            Long roadmapId, GrammarStatus status);

    Optional<GrammarTopic> findBySlugAndStatus(String slug, GrammarStatus status);

    // =====================================================
    // CHO GIÁO VIÊN / ADMIN (thấy mọi status)
    // =====================================================
    List<GrammarTopic> findByRoadmapIdOrderByDisplayOrderAsc(Long roadmapId);

    List<GrammarTopic> findByRoadmapIdAndStatusInOrderByDisplayOrderAsc(
            Long roadmapId, List<GrammarStatus> statuses);

    List<GrammarTopic> findByStatusOrderByDisplayOrderAsc(GrammarStatus status);

    Optional<GrammarTopic> findBySlug(String slug);

    // =====================================================
    // ĐẾM / THỐNG KÊ
    // =====================================================
    int countByRoadmapId(Long roadmapId);

    int countByRoadmapIdAndStatus(Long roadmapId, GrammarStatus status);

    @Query("SELECT COALESCE(SUM(t.totalQuestions), 0) FROM GrammarTopic t " +
            "WHERE t.roadmap.id = :roadmapId AND t.status = :status")
    int sumTotalQuestionsByRoadmapIdAndStatus(
            @Param("roadmapId") Long roadmapId,
            @Param("status") GrammarStatus status);

    // Kiểm tra slug đã tồn tại (trừ chính nó khi update)
    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}