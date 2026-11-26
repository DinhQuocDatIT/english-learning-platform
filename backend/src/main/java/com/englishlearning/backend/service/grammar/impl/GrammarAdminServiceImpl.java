package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.request.GrammarReassignRequest;
import com.englishlearning.backend.dto.grammar.request.GrammarRoadmapRequest;
import com.englishlearning.backend.dto.grammar.response.*;
import com.englishlearning.backend.entity.GrammarRoadmap;
import com.englishlearning.backend.entity.GrammarTheory;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.enums.GrammarReviewAction;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.*;
import com.englishlearning.backend.service.grammar.GrammarAdminService;
import com.englishlearning.backend.service.grammar.GrammarTopicReviewService;
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
    private final GrammarExampleRepository exampleRepository;
    private final GrammarTipRepository tipRepository;
    private final GrammarQuizRepository quizRepository;
    private final UserRepository userRepository;
    private final GrammarTopicReviewService reviewService;

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
                            "Vui lòng xóa các chủ điểm trước.");
        }

        roadmapRepository.delete(roadmap);
    }

    // =====================================================
    // TOPIC
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

    @Override
    public GrammarTopicResponse publishTopic(Long adminId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        if (topic.getStatus() != GrammarStatus.PENDING) {
            throw new BusinessException("Chỉ có thể publish chủ điểm đang chờ duyệt");
        }

        topic.setStatus(GrammarStatus.PUBLISHED);
        GrammarTopic saved = topicRepository.save(topic);

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

        exampleRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PENDING, GrammarStatus.PUBLISHED);
        exampleRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.DRAFT, GrammarStatus.PUBLISHED);
        exampleRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.REJECTED, GrammarStatus.PUBLISHED);

        tipRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PENDING, GrammarStatus.PUBLISHED);
        tipRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.DRAFT, GrammarStatus.PUBLISHED);
        tipRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.REJECTED, GrammarStatus.PUBLISHED);

        quizRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PENDING, GrammarStatus.PUBLISHED);
        quizRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.DRAFT, GrammarStatus.PUBLISHED);
        quizRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.REJECTED, GrammarStatus.PUBLISHED);

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy admin"));
        reviewService.log(topic, GrammarReviewAction.APPROVE, null, admin);

        return toTopicResponse(saved);
    }

    @Override
    public GrammarTopicResponse unpublishTopic(Long adminId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        topic.setStatus(GrammarStatus.HIDDEN);
        GrammarTopic saved = topicRepository.save(topic);

        exampleRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PUBLISHED, GrammarStatus.HIDDEN);
        tipRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PUBLISHED, GrammarStatus.HIDDEN);
        quizRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PUBLISHED, GrammarStatus.HIDDEN);

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy admin"));
        reviewService.log(topic, GrammarReviewAction.UNPUBLISH, null, admin);

        return toTopicResponse(saved);
    }

    @Override
    public GrammarTopicResponse rejectTopic(Long adminId, Long topicId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new BusinessException("Vui lòng nhập lý do từ chối");
        }

        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        if (topic.getStatus() != GrammarStatus.PENDING) {
            throw new BusinessException("Chỉ có thể từ chối chủ điểm đang chờ duyệt");
        }

        topic.setStatus(GrammarStatus.REJECTED);
        GrammarTopic saved = topicRepository.save(topic);

        List<GrammarTheory> theories = theoryRepository
                .findByTopicIdOrderByDisplayOrderAsc(topicId);
        for (GrammarTheory theory : theories) {
            if (theory.getStatus() == GrammarStatus.PENDING) {
                theory.setStatus(GrammarStatus.REJECTED);
            }
        }
        theoryRepository.saveAll(theories);

        exampleRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PENDING, GrammarStatus.REJECTED);
        tipRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PENDING, GrammarStatus.REJECTED);
        quizRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.PENDING, GrammarStatus.REJECTED);

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy admin"));
        reviewService.log(topic, GrammarReviewAction.REJECT, reason.trim(), admin);

        return toTopicResponse(saved);
    }

    @Override
    public GrammarTopicResponse restoreTopic(Long adminId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        if (topic.getStatus() != GrammarStatus.HIDDEN) {
            throw new BusinessException("Chỉ có thể bỏ ẩn chủ điểm đang bị ẩn");
        }

        topic.setStatus(GrammarStatus.PUBLISHED);
        GrammarTopic saved = topicRepository.save(topic);

        List<GrammarTheory> theories = theoryRepository
                .findByTopicIdOrderByDisplayOrderAsc(topicId);
        for (GrammarTheory theory : theories) {
            if (theory.getStatus() == GrammarStatus.HIDDEN
                    || theory.getStatus() == GrammarStatus.PUBLISHED) {
                theory.setStatus(GrammarStatus.PUBLISHED);
            }
        }
        theoryRepository.saveAll(theories);

        exampleRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.HIDDEN, GrammarStatus.PUBLISHED);
        tipRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.HIDDEN, GrammarStatus.PUBLISHED);
        quizRepository.updateStatusByTopicAndFromStatus(
                topicId, GrammarStatus.HIDDEN, GrammarStatus.PUBLISHED);

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy admin"));
        reviewService.log(topic, GrammarReviewAction.APPROVE, "Bỏ ẩn chủ điểm", admin);

        return toTopicResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarTopicReviewResponse> getTopicHistory(Long topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new ResourceNotFoundException("Không tìm thấy chủ điểm");
        }
        return reviewService.getHistory(topicId);
    }

    // =====================================================
    // REASSIGN
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<TeacherSummaryResponse> getTeachersWithTopics() {
        return userRepository.findTeachersWithTopicCount()
                .stream()
                .map(row -> {
                    User u = (User) row[0];
                    Long count = (Long) row[1];
                    return TeacherSummaryResponse.builder()
                            .id(u.getId())
                            .fullName(u.getFullName())
                            .email(u.getEmail())
                            .topicCount(count)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarTopicResponse> getTopicsByTeacher(Long teacherId) {
        return topicRepository.findByCreatedByIdOrderByDisplayOrderAsc(teacherId)
                .stream()
                .map(this::toTopicResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void reassignTopics(Long adminId, GrammarReassignRequest request) {
        if (request.getTopicIds() == null || request.getTopicIds().isEmpty()) {
            throw new BusinessException("Vui lòng chọn ít nhất 1 chủ điểm để chuyển giao");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy admin"));
        User newOwner = userRepository.findById(request.getNewOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy teacher mới"));

        List<GrammarTopic> topics = topicRepository.findAllById(request.getTopicIds());

        if (topics.isEmpty()) {
            throw new BusinessException("Không tìm thấy chủ điểm nào hợp lệ");
        }

        for (GrammarTopic topic : topics) {
            User oldOwner = topic.getCreatedBy();
            if (oldOwner.getId().equals(newOwner.getId())) {
                continue;
            }

            topic.setCreatedBy(newOwner);
            topicRepository.save(topic);

            reviewService.log(topic, GrammarReviewAction.REASSIGN,
                    "Chuyển giao từ " + oldOwner.getFullName() + " sang " + newOwner.getFullName(), admin);
        }
    }

    // =====================================================
    // MAPPER
    // =====================================================

    private GrammarRoadmapResponse toRoadmapResponseAdmin(GrammarRoadmap r) {
        int totalTopics = topicRepository.countForAdmin(r.getId());
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
                .roadmapId(t.getRoadmap() != null ? t.getRoadmap().getId() : null)
                .roadmapName(t.getRoadmap() != null ? t.getRoadmap().getName() : null)
                .createdById(t.getCreatedBy() != null ? t.getCreatedBy().getId() : null)
                .createdByName(t.getCreatedBy() != null ? t.getCreatedBy().getFullName() : null)
                .isOwner(false)
                .canRequestEdit(null)
                .build();
    }
}