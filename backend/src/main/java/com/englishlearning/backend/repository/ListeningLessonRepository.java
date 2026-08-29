package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ListeningLesson;
import com.englishlearning.backend.enums.ListeningLessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ListeningLessonRepository extends JpaRepository<ListeningLesson, Long> {
    List<ListeningLesson>
    findAllByCreatedByIdOrderByCreatedAtDesc(Long teacherId);
    List<ListeningLesson>
    findAllByTopicIdOrderByCreatedAtDesc(Long topicId);
    List<ListeningLesson>
    findAllByTopicIdAndStatusOrderByCreatedAtDesc(
            Long topicId,
            ListeningLessonStatus status
    );

    List<ListeningLesson>
    findAllByStatusOrderByCreatedAtDesc(
            ListeningLessonStatus status
    );
    List<ListeningLesson>
    findAllByOrderByCreatedAtDesc();
    List<ListeningLesson> findAllByCreatedByIdAndTopicIdOrderByCreatedAtDesc(
            Long teacherId,
            Long topicId
    );
    @Query("SELECT COUNT(l) FROM ListeningLesson l WHERE l.topic.id = :topicId AND l.status = :status")
    long countByTopicIdAndStatus(
            @Param("topicId") Long topicId,
            @Param("status") ListeningLessonStatus status
    );
}