package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarReassignRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarRoadmapRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarRoadmapResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicReviewResponse;
import com.englishlearning.backend.dto.grammar.response.TeacherSummaryResponse;

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
    GrammarTopicResponse publishTopic(Long adminId, Long topicId);
    GrammarTopicResponse unpublishTopic(Long adminId, Long topicId);
    GrammarTopicResponse rejectTopic(Long adminId, Long topicId, String reason);
    GrammarTopicResponse restoreTopic(Long adminId, Long topicId);
    // Review history
    List<GrammarTopicReviewResponse> getTopicHistory(Long topicId);
    List<TeacherSummaryResponse> getTeachersWithTopics();
    List<GrammarTopicResponse> getTopicsByTeacher(Long teacherId);
    void reassignTopics(Long adminId, GrammarReassignRequest request);
}