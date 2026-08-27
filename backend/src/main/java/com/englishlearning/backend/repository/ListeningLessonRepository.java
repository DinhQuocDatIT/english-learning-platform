package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ListeningLesson;
import com.englishlearning.backend.enums.ListeningLessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;

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
}