package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.request.GrammarRoadmapRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarRoadmapResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicResponse;
import com.englishlearning.backend.entity.GrammarRoadmap;
import com.englishlearning.backend.entity.GrammarTheory;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.GrammarRoadmapRepository;
import com.englishlearning.backend.repository.GrammarTheoryRepository;
import com.englishlearning.backend.repository.GrammarTopicRepository;
import com.englishlearning.backend.service.grammar.GrammarAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GrammarAdminServiceImpl implements GrammarAdminService {

    private final GrammarRoadmapRepository roadmapRepository;
    private final GrammarTopicRepository topicRepository;
    private final GrammarTheoryRepository theoryRepository;

    // =====================================================
    // ROADMAP
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarRoadmapResponse> getAllRoadmaps() {
        return roadmapRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::toRoadmapResponseAdmin)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarRoadmapResponse getRoadmapById(Long id) {
        GrammarRoadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lộ trình"));
        return toRoadmapResponseAdmin(roadmap);
    }

    @Override
    public GrammarRoadmapResponse createRoadmap(GrammarRoadmapRequest request) {
        if (roadmapRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BusinessException("Tên lộ trình đã tồn tại: " + request.getName());
        }

        GrammarRoadmap roadmap = new GrammarRoadmap();
        roadmap.setName(request.getName().trim());
        roadmap.setSubtitle(request.getSubtitle());
        roadmap.setLevel(request.getLevel() != null ? request.getLevel() : 1);
        roadmap.setLevelLabel(request.getLevelLabel());
        roadmap.setDescription(request.getDescription());
        roadmap.setColor(request.getColor() != null ? request.getColor() : "#0ea792");
        roadmap.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        GrammarRoadmap saved = roadmapRepository.save(roadmap);
        return toRoadmapResponseAdmin(saved);
    }

    @Override
    public GrammarRoadmapResponse updateRoadmap(Long id, GrammarRoadmapRequest request) {
        GrammarRoadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lộ trình"));

        if (!roadmap.getName().equalsIgnoreCase(request.getName().trim())
                && roadmapRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BusinessException("Tên lộ trình đã tồn tại: " + request.getName());
        }

        roadmap.setName(request.getName().trim());
        roadmap.setSubtitle(request.getSubtitle());
        if (request.getLevel() != null) roadmap.setLevel(request.getLevel());
        roadmap.setLevelLabel(request.getLevelLabel());
        roadmap.setDescription(request.getDescription());
        if (request.getColor() != null) roadmap.setColor(request.getColor());
        if (request.getDisplayOrder() != null) roadmap.setDisplayOrder(request.getDisplayOrder());

        GrammarRoadmap saved = roadmapRepository.save(roadmap);
        return toRoadmapResponseAdmin(saved);
    }

    @Override
    public void deleteRoadmap(Long id) {
        GrammarRoadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lộ trình"));

        int topicCount = topicRepository.countByRoadmapId(id);
        if (topicCount > 0) {
            throw new BusinessException(
                    "Không thể xóa vì lộ trình đang có " + topicCount + " chủ điểm. " +
                            "Vui lòng xóa các chủ điểm trước."
            );
        }

        roadmapRepository.delete(roadmap);
    }

    // =====================================================
    // TOPIC — Admin thấy tất cả trừ DRAFT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarTopicResponse> getTopicsByRoadmap(Long roadmapId) {
        return topicRepository.findForAdmin(roadmapId)
                .stream()
                .map(this::toTopicResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarTopicResponse getTopicById(Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));
        return toTopicResponse(topic);
    }

    /**
     * ADMIN PUBLISH TOPIC
     * - Đổi status topic → PUBLISHED
     * - Publish LUÔN tất cả theory của topic (PENDING/DRAFT → PUBLISHED)
     */
    @Override
    public GrammarTopicResponse publishTopic(Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        // 1. Đổi status topic
        topic.setStatus(GrammarStatus.PUBLISHED);
        GrammarTopic saved = topicRepository.save(topic);

        // 2. Publish tất cả theory của topic
        List<GrammarTheory> theories = theoryRepository
                .findByTopicIdOrderByDisplayOrderAsc(topicId);
        for (GrammarTheory theory : theories) {
            if (theory.getStatus() == GrammarStatus.PENDING
                    || theory.getStatus() == GrammarStatus.DRAFT
                    || theory.getStatus() == GrammarStatus.REJECTED) {
                theory.setStatus(GrammarStatus.PUBLISHED);
            }
        }
        theoryRepository.saveAll(theories);

        log.info("✅ Admin đã publish topic id={}, {} theory đã publish",
                topicId, theories.size());

        return toTopicResponse(saved);
    }

    /**
     * ADMIN UNPUBLISH TOPIC (ẩn)
     * - Đổi status topic → HIDDEN
     */
    @Override
    public GrammarTopicResponse unpublishTopic(Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        topic.setStatus(GrammarStatus.HIDDEN);
        GrammarTopic saved = topicRepository.save(topic);

        log.info("✅ Admin đã ẩn topic id={}", topicId);
        return toTopicResponse(saved);
    }

    // =====================================================
    // MAPPER
    // =====================================================

    private GrammarRoadmapResponse toRoadmapResponseAdmin(GrammarRoadmap r) {
        // Tổng số topic không tính DRAFT
        int totalTopics = topicRepository.countForAdmin(r.getId());

        // Số topic đang chờ duyệt
        int pendingTopics = topicRepository.countByRoadmapIdAndStatus(
                r.getId(), GrammarStatus.PENDING);

        return GrammarRoadmapResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .subtitle(r.getSubtitle())
                .level(r.getLevel())
                .levelLabel(r.getLevelLabel())
                .description(r.getDescription())
                .color(r.getColor())
                .totalTopics(totalTopics)
                .pendingTopics(pendingTopics)
                .build();
    }

    private GrammarTopicResponse toTopicResponse(GrammarTopic t) {
        return GrammarTopicResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .slug(t.getSlug())
                .description(t.getDescription())
                .displayOrder(t.getDisplayOrder())
                .status(t.getStatus().name())
                .build();
    }
}