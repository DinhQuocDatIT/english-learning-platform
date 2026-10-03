package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarExample;
import com.englishlearning.backend.enums.GrammarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarExampleRepository extends JpaRepository<GrammarExample, Long> {

    List<GrammarExample> findByTopicIdOrderByDisplayOrderAsc(Long topicId);

    List<GrammarExample> findByTopicIdAndStatusOrderByDisplayOrderAsc(
            Long topicId, GrammarStatus status);

    // Đếm để hiển thị badge
    int countByTopicIdAndStatus(Long topicId, GrammarStatus status);

    @Modifying
    @Query("UPDATE GrammarExample e SET e.status = :status WHERE e.topic.id = :topicId AND e.status = :fromStatus")
    int updateStatusByTopicAndFromStatus(
            @Param("topicId") Long topicId,
            @Param("fromStatus") GrammarStatus fromStatus,
            @Param("status") GrammarStatus status);
}