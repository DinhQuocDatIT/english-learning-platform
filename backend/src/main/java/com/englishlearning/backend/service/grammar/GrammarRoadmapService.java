package com.englishlearning.backend.service.grammar;


import com.englishlearning.backend.dto.grammar.response.GrammarRoadmapResponse;

import java.util.List;

public interface GrammarRoadmapService {

    /** Lấy tất cả roadmap (cho trang "Lộ trình ngữ pháp TOEIC") */
    List<GrammarRoadmapResponse> getAllRoadmaps();

    /** Lấy chi tiết roadmap + cây topic (chỉ topic PUBLISHED) */
    GrammarRoadmapResponse getRoadmapDetail(Long roadmapId);
}