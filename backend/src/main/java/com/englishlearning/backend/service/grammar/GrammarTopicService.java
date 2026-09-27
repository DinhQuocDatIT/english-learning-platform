package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.response.GrammarTopicDetailResponse;

public interface GrammarTopicService {
    GrammarTopicDetailResponse getTopicDetail(Long topicId);
}