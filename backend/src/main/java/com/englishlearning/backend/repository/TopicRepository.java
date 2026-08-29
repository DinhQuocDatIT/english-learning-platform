package com.englishlearning.backend.repository;



import com.englishlearning.backend.entity.Topic;
import com.englishlearning.backend.enums.TopicStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicRepository
        extends JpaRepository<Topic, Long> {
    List<Topic> findAllByStatusOrderByCreatedAtDesc(
            TopicStatus status
    );

    List<Topic> findAllByOrderByCreatedAtDesc();
    List<Topic> findAllByStatus(TopicStatus status);
}