package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarTheoryCreateRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarTopicRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarTheoryResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicDetailResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicResponse;

import java.util.List;

public interface GrammarTeacherService {

    // =====================================================
    // TOPIC
    // =====================================================
    List<GrammarTopicResponse> getMyTopics(Long teacherId, Long roadmapId);

    GrammarTopicDetailResponse getTopicForEdit(Long teacherId, Long topicId);

    GrammarTopicResponse createTopic(Long teacherId, GrammarTopicRequest request);

    GrammarTopicResponse updateTopic(Long teacherId, Long topicId, GrammarTopicRequest request);

    void deleteTopic(Long teacherId, Long topicId);

    GrammarTopicResponse submitTopicForReview(Long teacherId, Long topicId);

    // =====================================================
    // THEORY
    // =====================================================
    List<GrammarTheoryResponse> getTheoriesForEdit(Long teacherId, Long topicId);

    GrammarTheoryResponse createTheory(Long teacherId, GrammarTheoryCreateRequest request);

    List<GrammarTheoryResponse> createTheoriesBatch(
            Long teacherId, Long topicId,
            GrammarTheoryCreateRequest.BatchCreateRequest request);

    GrammarTheoryResponse updateTheory(Long teacherId, Long theoryId,
                                       GrammarTheoryCreateRequest request);

    void deleteTheory(Long teacherId, Long theoryId);
}