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

import java.util.*;
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
    // GET ROADMAP DETAIL (kèm cây topic PUBLISHED)
    // =====================================================
    @Override
    public GrammarRoadmapResponse getRoadmapDetail(Long roadmapId) {
        GrammarRoadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lộ trình"));

        // Chỉ lấy topic đã PUBLISHED
        List<GrammarTopic> allTopics = topicRepository
                .findByRoadmapIdAndStatusOrderByDisplayOrderAsc(
                        roadmapId, GrammarStatus.PUBLISHED);

        List<GrammarTopicResponse> tree = buildTree(allTopics);

        GrammarRoadmapResponse response = toResponse(roadmap, true);
        response.setTopics(tree);
        return response;
    }

    // =====================================================
    // BUILD TREE (parent/children)
    // =====================================================
    private List<GrammarTopicResponse> buildTree(List<GrammarTopic> allTopics) {
        if (allTopics.isEmpty()) return new ArrayList<>();

        Map<Long, GrammarTopicResponse> map = new LinkedHashMap<>();

        // Tạo response cho mỗi topic
        for (GrammarTopic t : allTopics) {
            map.put(t.getId(), GrammarTopicResponse.builder()
                    .id(t.getId())
                    .name(t.getName())
                    .slug(t.getSlug())
                    .description(t.getDescription())
                    .displayOrder(t.getDisplayOrder())
                    .totalQuestions(t.getTotalQuestions())
                    .icon(t.getIcon())
                    .parentId(t.getParent() != null ? t.getParent().getId() : null)
                    .status(t.getStatus().name())
                    .children(new ArrayList<>())
                    .build());
        }

        // Gắn con vào cha
        List<GrammarTopicResponse> roots = new ArrayList<>();
        for (GrammarTopicResponse node : map.values()) {
            if (node.getParentId() == null) {
                roots.add(node);
            } else {
                GrammarTopicResponse parent = map.get(node.getParentId());
                if (parent != null) {
                    parent.getChildren().add(node);
                } else {
                    // Parent không có trong danh sách (bị filter do status)
                    // → coi như root để không mất dữ liệu
                    roots.add(node);
                }
            }
        }

        // Sort theo displayOrder (giữ nguyên thứ tự)
        roots.sort(Comparator.comparing(GrammarTopicResponse::getDisplayOrder,
                Comparator.nullsLast(Comparator.naturalOrder())));

        return roots;
    }

    // =====================================================
    // MAP → RESPONSE
    // =====================================================
    private GrammarRoadmapResponse toResponse(GrammarRoadmap r, boolean includeTopics) {
        int totalTopics = topicRepository.countByRoadmapIdAndStatus(
                r.getId(), GrammarStatus.PUBLISHED);
        int totalQuestions = topicRepository.sumTotalQuestionsByRoadmapIdAndStatus(
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
                .totalQuestions(totalQuestions)
                .build();
    }
}