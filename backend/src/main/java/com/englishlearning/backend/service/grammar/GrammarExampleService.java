package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarExampleRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarExampleResponse;

import java.util.List;

public interface GrammarExampleService {

    // ===== PUBLIC (Student) =====
    List<GrammarExampleResponse> getPublishedExamples(Long topicId);

    // ===== TEACHER =====
    List<GrammarExampleResponse> getExamplesForEdit(Long teacherId, Long topicId);
    GrammarExampleResponse createExample(Long teacherId, GrammarExampleRequest request);
    GrammarExampleResponse updateExample(Long teacherId, Long exampleId, GrammarExampleRequest request);
    void deleteExample(Long teacherId, Long exampleId);

    // ===== ADMIN =====
    List<GrammarExampleResponse> getExamplesForAdmin(Long topicId);
}