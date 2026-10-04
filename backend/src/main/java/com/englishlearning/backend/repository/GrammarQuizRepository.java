package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarQuiz;
import com.englishlearning.backend.enums.GrammarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarQuizRepository extends JpaRepository<GrammarQuiz, Long> {

    List<GrammarQuiz> findByTopicIdOrderByDisplayOrderAsc(Long topicId);

    List<GrammarQuiz> findByTopicIdAndStatusOrderByDisplayOrderAsc(
            Long topicId, GrammarStatus status);

    int countByTopicIdAndStatus(Long topicId, GrammarStatus status);

    @Modifying
    @Query("UPDATE GrammarQuiz q SET q.status = :status WHERE q.topic.id = :topicId AND q.status = :fromStatus")
    int updateStatusByTopicAndFromStatus(
            @Param("topicId") Long topicId,
            @Param("fromStatus") GrammarStatus fromStatus,
            @Param("status") GrammarStatus status);
}