package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.request.GrammarTipRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarTipResponse;

import java.util.List;

public interface GrammarTipService {

    // ===== PUBLIC (Student) =====
    List<GrammarTipResponse> getPublishedTips(Long topicId);

    // ===== TEACHER =====
    List<GrammarTipResponse> getTipsForEdit(Long teacherId, Long topicId);
    GrammarTipResponse createTip(Long teacherId, GrammarTipRequest request);
    GrammarTipResponse updateTip(Long teacherId, Long tipId, GrammarTipRequest request);
    void deleteTip(Long teacherId, Long tipId);

    // ===== ADMIN =====
    List<GrammarTipResponse> getTipsForAdmin(Long topicId);
}