package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarTip;
import com.englishlearning.backend.enums.GrammarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarTipRepository extends JpaRepository<GrammarTip, Long> {

    List<GrammarTip> findByTopicIdOrderByDisplayOrderAsc(Long topicId);

    List<GrammarTip> findByTopicIdAndStatusOrderByDisplayOrderAsc(
            Long topicId, GrammarStatus status);

    int countByTopicIdAndStatus(Long topicId, GrammarStatus status);

    @Modifying
    @Query("UPDATE GrammarTip t SET t.status = :status WHERE t.topic.id = :topicId AND t.status = :fromStatus")
    int updateStatusByTopicAndFromStatus(
            @Param("topicId") Long topicId,
            @Param("fromStatus") GrammarStatus fromStatus,
            @Param("status") GrammarStatus status);
}