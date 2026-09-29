package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.response.GrammarTopicReviewResponse;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.entity.GrammarTopicReview;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.enums.GrammarReviewAction;
import com.englishlearning.backend.repository.GrammarTopicReviewRepository;
import com.englishlearning.backend.service.grammar.GrammarTopicReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GrammarTopicReviewServiceImpl implements GrammarTopicReviewService {

    private final GrammarTopicReviewRepository reviewRepository;

    @Override
    public void log(GrammarTopic topic, GrammarReviewAction action,
                    String reason, User performedBy) {
        GrammarTopicReview entry = GrammarTopicReview.builder()
                .grammarTopic(topic)
                .action(action)
                .reason(reason)
                .performedBy(performedBy)
                .build();
        reviewRepository.save(entry);

        log.info("📝 Review log: topicId={}, action={}, by={}",
                topic.getId(), action, performedBy.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarTopicReviewResponse> getHistory(Long topicId) {
        return reviewRepository
                .findByGrammarTopicIdOrderByPerformedAtDesc(topicId)
                .stream()
                .map(GrammarTopicReviewResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public String getLatestRejectReason(Long topicId) {
        GrammarTopicReview h = reviewRepository
                .findFirstByGrammarTopicIdAndActionOrderByPerformedAtDesc(
                        topicId, GrammarReviewAction.REJECT);
        return h != null ? h.getReason() : null;
    }
}