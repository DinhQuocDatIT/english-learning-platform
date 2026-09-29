package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarRoadmapRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarRoadmapResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicResponse;

import java.util.List;

public interface GrammarAdminService {

    // Roadmap
    List<GrammarRoadmapResponse> getAllRoadmaps();
    GrammarRoadmapResponse getRoadmapById(Long id);
    GrammarRoadmapResponse createRoadmap(GrammarRoadmapRequest request);
    GrammarRoadmapResponse updateRoadmap(Long id, GrammarRoadmapRequest request);
    void deleteRoadmap(Long id);

    // Topic
    List<GrammarTopicResponse> getTopicsByRoadmap(Long roadmapId);
    GrammarTopicResponse getTopicById(Long topicId);
    GrammarTopicResponse publishTopic(Long topicId);
    GrammarTopicResponse unpublishTopic(Long topicId);
}