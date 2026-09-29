package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarTopicReview;
import com.englishlearning.backend.enums.GrammarReviewAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrammarTopicReviewRepository
        extends JpaRepository<GrammarTopicReview, Long> {

    List<GrammarTopicReview> findByGrammarTopicIdOrderByPerformedAtDesc(Long topicId);

    GrammarTopicReview findFirstByGrammarTopicIdAndActionOrderByPerformedAtDesc(
            Long topicId, GrammarReviewAction action
    );
}