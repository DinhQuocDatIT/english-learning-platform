package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.request.GrammarTheoryCreateRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarTopicRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarRoadmapResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTheoryResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicDetailResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicReviewResponse;
import com.englishlearning.backend.entity.GrammarRoadmap;
import com.englishlearning.backend.entity.GrammarTheory;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.enums.GrammarReviewAction;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.GrammarExampleRepository;
import com.englishlearning.backend.repository.GrammarRoadmapRepository;
import com.englishlearning.backend.repository.GrammarTheoryRepository;
import com.englishlearning.backend.repository.GrammarTipRepository;
import com.englishlearning.backend.repository.GrammarTopicRepository;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.grammar.GrammarTeacherService;
import com.englishlearning.backend.service.grammar.GrammarTopicReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GrammarTeacherServiceImpl implements GrammarTeacherService {

    private final GrammarRoadmapRepository roadmapRepository;
    private final GrammarTopicRepository topicRepository;
    private final GrammarTheoryRepository theoryRepository;
    private final GrammarExampleRepository exampleRepository;
    private final GrammarTipRepository tipRepository;
    private final UserRepository userRepository;
    private final GrammarTopicReviewService reviewService;
    private final ObjectMapper objectMapper;

    // =====================================================
    // ROADMAP
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarRoadmapResponse> getAllRoadmapsForTeacher(Long teacherId) {
        return roadmapRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(r -> {
                    int totalTopics = topicRepository.countForTeacher(r.getId(), teacherId);
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
                })
                .collect(Collectors.toList());
    }

    // =====================================================
    // TOPIC
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarTopicResponse> getMyTopics(Long teacherId, Long roadmapId) {
        if (roadmapId == null) {
            return new ArrayList<>();
        }
        return topicRepository.findForTeacher(roadmapId, teacherId)
                .stream()
                .map(this::toTopicResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarTopicDetailResponse getTopicForEdit(Long teacherId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        List<GrammarTheoryResponse> theories = theoryRepository
                .findByTopicIdOrderByDisplayOrderAsc(topicId)
                .stream()
                .map(this::toTheoryResponse)
                .collect(Collectors.toList());

        return GrammarTopicDetailResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .slug(topic.getSlug())
                .description(topic.getDescription())
                .displayOrder(topic.getDisplayOrder())
                .status(topic.getStatus().name())
                .theories(theories)
                .build();
    }

    @Override
    public GrammarTopicResponse createTopic(Long teacherId, GrammarTopicRequest request) {
        if (topicRepository.existsBySlug(request.getSlug())) {
            throw new BusinessException("Slug đã tồn tại: " + request.getSlug());
        }

        GrammarRoadmap roadmap = roadmapRepository.findById(request.getRoadmapId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy roadmap"));

        GrammarTopic topic = new GrammarTopic();
        topic.setRoadmap(roadmap);
        topic.setCreatedBy(userRepository.getReferenceById(teacherId));
        topic.setName(request.getName().trim());
        topic.setSlug(request.getSlug().trim().toLowerCase());
        topic.setDescription(request.getDescription());
        topic.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        topic.setStatus(GrammarStatus.DRAFT);

        GrammarTopic saved = topicRepository.save(topic);
        return toTopicResponse(saved);
    }

    @Override
    public GrammarTopicResponse updateTopic(Long teacherId, Long topicId, GrammarTopicRequest request) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        // ✅ Check quyền sở hữu
        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền sửa chủ điểm này");
        }

        if (topic.getStatus() != GrammarStatus.DRAFT
                && topic.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException("Chỉ có thể sửa chủ điểm ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        if (!topic.getSlug().equals(request.getSlug())
                && topicRepository.existsBySlugAndIdNot(request.getSlug(), topicId)) {
            throw new BusinessException("Slug đã tồn tại: " + request.getSlug());
        }

        topic.setName(request.getName().trim());
        topic.setSlug(request.getSlug().trim().toLowerCase());
        topic.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) topic.setDisplayOrder(request.getDisplayOrder());

        GrammarTopic saved = topicRepository.save(topic);
        return toTopicResponse(saved);
    }

    @Override
    public void deleteTopic(Long teacherId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        // ✅ Check quyền sở hữu
        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền xóa chủ điểm này");
        }

        if (topic.getStatus() != GrammarStatus.DRAFT) {
            throw new BusinessException("Chỉ có thể xóa chủ điểm ở trạng thái NHÁP");
        }

        topicRepository.delete(topic);
    }

    @Override
    public GrammarTopicResponse submitTopicForReview(Long teacherId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        // ✅ Check quyền sở hữu
        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền gửi duyệt chủ điểm này");
        }

        if (topic.getStatus() != GrammarStatus.DRAFT
                && topic.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException("Chỉ có thể gửi duyệt chủ điểm ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        topic.setStatus(GrammarStatus.PENDING);
        topicRepository.save(topic);

        // ===== Theory: DRAFT/REJECTED → PENDING =====
        List<GrammarTheory> theories = theoryRepository
                .findByTopicIdOrderByDisplayOrderAsc(topicId);
        for (GrammarTheory theory : theories) {
            if (theory.getStatus() == GrammarStatus.DRAFT
                    || theory.getStatus() == GrammarStatus.REJECTED) {
                theory.setStatus(GrammarStatus.PENDING);
            }
        }
        theoryRepository.saveAll(theories);

        // ===== Example: DRAFT/REJECTED → PENDING =====
        exampleRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.DRAFT, GrammarStatus.PENDING);
        exampleRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.REJECTED, GrammarStatus.PENDING);

        // ===== Tip: DRAFT/REJECTED → PENDING =====
        tipRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.DRAFT, GrammarStatus.PENDING);
        tipRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.REJECTED, GrammarStatus.PENDING);

        // 📝 Ghi lịch sử duyệt
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
        reviewService.log(topic, GrammarReviewAction.SUBMIT, null, teacher);

        log.info("📤 Teacher {} đã gửi duyệt topic id={}", teacherId, topicId);
        return toTopicResponse(topic);
    }

    // =====================================================
    // REVIEW HISTORY
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarTopicReviewResponse> getTopicHistory(Long teacherId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền xem lịch sử chủ điểm này");
        }

        return reviewService.getHistory(topicId);
    }

    // =====================================================
    // THEORY
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarTheoryResponse> getTheoriesForEdit(Long teacherId, Long topicId) {
        return theoryRepository.findByTopicIdOrderByDisplayOrderAsc(topicId)
                .stream()
                .map(this::toTheoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GrammarTheoryResponse createTheory(Long teacherId, GrammarTheoryCreateRequest request) {
        GrammarTopic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền thêm lý thuyết cho chủ điểm này");
        }

        if (topic.getStatus() != GrammarStatus.DRAFT
                && topic.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException("Chỉ có thể thêm lý thuyết khi chủ điểm ở trạng thái NHÁP");
        }

        GrammarTheory theory = new GrammarTheory();
        theory.setTopic(topic);
        theory.setTitle(request.getTitle());
        theory.setSectionType(request.getSectionType());
        theory.setContent(request.getContent());
        theory.setMetadata(serializeMetadata(request.getMetadata()));
        theory.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        theory.setStatus(GrammarStatus.DRAFT);

        GrammarTheory saved = theoryRepository.save(theory);
        return toTheoryResponse(saved);
    }

    @Override
    public List<GrammarTheoryResponse> createTheoriesBatch(
            Long teacherId, Long topicId,
            GrammarTheoryCreateRequest.BatchCreateRequest request) {

        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền thêm lý thuyết cho chủ điểm này");
        }

        if (topic.getStatus() != GrammarStatus.DRAFT
                && topic.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException("Chỉ có thể thêm lý thuyết khi chủ điểm ở trạng thái NHÁP");
        }

        List<GrammarTheory> theories = new ArrayList<>();
        int order = 1;

        for (GrammarTheoryCreateRequest item : request.getSections()) {
            GrammarTheory theory = new GrammarTheory();
            theory.setTopic(topic);
            theory.setTitle(item.getTitle());
            theory.setSectionType(item.getSectionType());
            theory.setContent(item.getContent());
            theory.setMetadata(serializeMetadata(item.getMetadata()));
            theory.setDisplayOrder(item.getDisplayOrder() != null ? item.getDisplayOrder() : order++);
            theory.setStatus(GrammarStatus.DRAFT);
            theories.add(theory);
        }

        List<GrammarTheory> saved = theoryRepository.saveAll(theories);
        return saved.stream().map(this::toTheoryResponse).collect(Collectors.toList());
    }

    @Override
    public GrammarTheoryResponse updateTheory(Long teacherId, Long theoryId,
                                              GrammarTheoryCreateRequest request) {
        GrammarTheory theory = theoryRepository.findById(theoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lý thuyết"));

        if (!theory.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền sửa lý thuyết này");
        }

        if (theory.getStatus() != GrammarStatus.DRAFT
                && theory.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException("Chỉ có thể sửa lý thuyết ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        theory.setTitle(request.getTitle());
        theory.setSectionType(request.getSectionType());
        theory.setContent(request.getContent());
        theory.setMetadata(serializeMetadata(request.getMetadata()));
        if (request.getDisplayOrder() != null) theory.setDisplayOrder(request.getDisplayOrder());

        GrammarTheory saved = theoryRepository.save(theory);
        return toTheoryResponse(saved);
    }

    @Override
    public void deleteTheory(Long teacherId, Long theoryId) {
        GrammarTheory theory = theoryRepository.findById(theoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lý thuyết"));

        if (!theory.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền xóa lý thuyết này");
        }

        if (theory.getStatus() != GrammarStatus.DRAFT) {
            throw new BusinessException("Chỉ có thể xóa lý thuyết ở trạng thái NHÁP");
        }

        theoryRepository.delete(theory);
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private String serializeMetadata(Object metadata) {
        if (metadata == null) return null;
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.warn("Lỗi serialize metadata: {}", e.getMessage());
            return null;
        }
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

    private GrammarTheoryResponse toTheoryResponse(GrammarTheory theory) {
        Object metadata = null;
        if (theory.getMetadata() != null && !theory.getMetadata().isBlank()) {
            try {
                JsonNode node = objectMapper.readTree(theory.getMetadata());
                metadata = objectMapper.convertValue(node, Object.class);
            } catch (Exception e) {
                log.warn("Lỗi parse metadata theory id={}: {}", theory.getId(), e.getMessage());
            }
        }

        return GrammarTheoryResponse.builder()
                .id(theory.getId())
                .topicId(theory.getTopic().getId())
                .title(theory.getTitle())
                .sectionType(theory.getSectionType())
                .content(theory.getContent())
                .metadata(metadata)
                .displayOrder(theory.getDisplayOrder())
                .status(theory.getStatus().name())
                .build();
    }
}