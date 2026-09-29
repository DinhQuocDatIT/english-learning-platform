package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.response.GrammarTopicReviewResponse;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.enums.GrammarReviewAction;

import java.util.List;

public interface GrammarTopicReviewService {

    void log(GrammarTopic topic, GrammarReviewAction action,
             String reason, User performedBy);

    List<GrammarTopicReviewResponse> getHistory(Long topicId);

    String getLatestRejectReason(Long topicId);
}