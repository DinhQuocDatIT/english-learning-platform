package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.response.GrammarRoadmapResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicResponse;
import com.englishlearning.backend.entity.GrammarRoadmap;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.GrammarRoadmapRepository;
import com.englishlearning.backend.repository.GrammarTopicRepository;
import com.englishlearning.backend.service.grammar.GrammarRoadmapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GrammarRoadmapServiceImpl implements GrammarRoadmapService {

    private final GrammarRoadmapRepository roadmapRepository;
    private final GrammarTopicRepository topicRepository;

    // =====================================================
    // GET ALL ROADMAPS
    // =====================================================
    @Override
    public List<GrammarRoadmapResponse> getAllRoadmaps() {
        return roadmapRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(r -> toResponse(r, false))
                .collect(Collectors.toList());
    }

    // =====================================================
    // GET ROADMAP DETAIL (kèm list topic PUBLISHED)
    // =====================================================
    @Override
    public GrammarRoadmapResponse getRoadmapDetail(Long roadmapId) {
        GrammarRoadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lộ trình"));

        // Chỉ lấy topic đã PUBLISHED
        List<GrammarTopicResponse> topics = topicRepository
                .findByRoadmapIdAndStatusOrderByDisplayOrderAsc(
                        roadmapId, GrammarStatus.PUBLISHED)
                .stream()
                .map(t -> GrammarTopicResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .slug(t.getSlug())
                        .description(t.getDescription())
                        .displayOrder(t.getDisplayOrder())
                        .status(t.getStatus().name())
                        .build())
                .collect(Collectors.toList());

        GrammarRoadmapResponse response = toResponse(roadmap, true);
        response.setTopics(topics);
        return response;
    }

    // =====================================================
    // MAP → RESPONSE
    // =====================================================
    private GrammarRoadmapResponse toResponse(GrammarRoadmap r, boolean includeTopics) {
        int totalTopics = topicRepository.countByRoadmapIdAndStatus(
                r.getId(), GrammarStatus.PUBLISHED);

        return GrammarRoadmapResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .subtitle(r.getSubtitle())
                .level(r.getLevel())
                .levelLabel(r.getLevelLabel())
                .description(r.getDescription())
                .color(r.getColor())
                .totalTopics(totalTopics)
                .build();
    }
}