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
    // STUDENT: chỉ thấy PUBLISHED
    // =====================================================
    List<GrammarTopic> findByRoadmapIdAndStatusOrderByDisplayOrderAsc(
            Long roadmapId, GrammarStatus status);

    Optional<GrammarTopic> findBySlugAndStatus(String slug, GrammarStatus status);

    // =====================================================
    // TEACHER: PUBLISHED của mọi người + của mình (mọi status)
    // =====================================================
    @Query("SELECT t FROM GrammarTopic t WHERE t.roadmap.id = :roadmapId " +
            "AND (t.status = 'PUBLISHED' OR t.createdBy.id = :teacherId) " +
            "ORDER BY t.displayOrder ASC")
    List<GrammarTopic> findForTeacher(
            @Param("roadmapId") Long roadmapId,
            @Param("teacherId") Long teacherId);

    // =====================================================
    // ADMIN: tất cả trừ DRAFT
    // =====================================================
    @Query("SELECT t FROM GrammarTopic t WHERE t.roadmap.id = :roadmapId " +
            "AND t.status != 'DRAFT' " +
            "ORDER BY t.displayOrder ASC")
    List<GrammarTopic> findForAdmin(@Param("roadmapId") Long roadmapId);

    // =====================================================
    // QUERY CŨ (giữ nguyên)
    // =====================================================
    List<GrammarTopic> findByRoadmapIdOrderByDisplayOrderAsc(Long roadmapId);
    List<GrammarTopic> findByRoadmapIdAndStatusInOrderByDisplayOrderAsc(
            Long roadmapId, List<GrammarStatus> statuses);
    List<GrammarTopic> findByStatusOrderByDisplayOrderAsc(GrammarStatus status);
    Optional<GrammarTopic> findBySlug(String slug);

    int countByRoadmapId(Long roadmapId);
    int countByRoadmapIdAndStatus(Long roadmapId, GrammarStatus status);

    // =====================================================
    // ĐẾM CHO ROADMAP (theo role)
    // =====================================================
    @Query("SELECT COUNT(t) FROM GrammarTopic t WHERE t.roadmap.id = :roadmapId " +
            "AND (t.status = 'PUBLISHED' OR t.createdBy.id = :teacherId)")
    int countForTeacher(
            @Param("roadmapId") Long roadmapId,
            @Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(t) FROM GrammarTopic t WHERE t.roadmap.id = :roadmapId " +
            "AND t.status != 'DRAFT'")
    int countForAdmin(@Param("roadmapId") Long roadmapId);

    // =====================================================
    // VALIDATE
    // =====================================================
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}