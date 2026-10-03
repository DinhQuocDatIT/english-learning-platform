package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.request.GrammarTipRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarTipResponse;
import com.englishlearning.backend.entity.GrammarTip;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.GrammarTipRepository;
import com.englishlearning.backend.repository.GrammarTopicRepository;
import com.englishlearning.backend.service.grammar.GrammarTipService;
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
public class GrammarTipServiceImpl implements GrammarTipService {

    private final GrammarTipRepository tipRepository;
    private final GrammarTopicRepository topicRepository;
    private final ObjectMapper objectMapper;

    // ===== PUBLIC =====
    @Override
    @Transactional(readOnly = true)
    public List<GrammarTipResponse> getPublishedTips(Long topicId) {
        return tipRepository
                .findByTopicIdAndStatusOrderByDisplayOrderAsc(topicId, GrammarStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== TEACHER =====
    @Override
    @Transactional(readOnly = true)
    public List<GrammarTipResponse> getTipsForEdit(Long teacherId, Long topicId) {
        GrammarTopic topic = findTopicAndCheckOwner(teacherId, topicId);
        return tipRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GrammarTipResponse createTip(Long teacherId, GrammarTipRequest request) {
        GrammarTopic topic = findTopicAndCheckOwner(teacherId, request.getTopicId());

        if (topic.getStatus() != GrammarStatus.DRAFT
                && topic.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException(
                    "Chỉ có thể thêm mẹo khi chủ điểm ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        GrammarTip tip = new GrammarTip();
        tip.setTopic(topic);
        applyRequest(tip, request);
        tip.setStatus(GrammarStatus.DRAFT);

        return toResponse(tipRepository.save(tip));
    }

    @Override
    public GrammarTipResponse updateTip(Long teacherId, Long tipId, GrammarTipRequest request) {
        GrammarTip tip = tipRepository.findById(tipId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẹo"));

        if (!tip.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền sửa mẹo này");
        }

        if (tip.getStatus() != GrammarStatus.DRAFT
                && tip.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException("Chỉ có thể sửa mẹo ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        applyRequest(tip, request);
        return toResponse(tipRepository.save(tip));
    }

    @Override
    public void deleteTip(Long teacherId, Long tipId) {
        GrammarTip tip = tipRepository.findById(tipId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẹo"));

        if (!tip.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền xóa mẹo này");
        }

        if (tip.getStatus() != GrammarStatus.DRAFT) {
            throw new BusinessException("Chỉ có thể xóa mẹo ở trạng thái NHÁP");
        }

        tipRepository.delete(tip);
    }

    // ===== ADMIN =====
    @Override
    @Transactional(readOnly = true)
    public List<GrammarTipResponse> getTipsForAdmin(Long topicId) {
        return tipRepository.findByTopicIdOrderByDisplayOrderAsc(topicId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== HELPERS =====
    private GrammarTopic findTopicAndCheckOwner(Long teacherId, Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));
        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền thao tác trên chủ điểm này");
        }
        return topic;
    }

    private void applyRequest(GrammarTip tip, GrammarTipRequest req) {
        tip.setTitle(req.getTitle().trim());
        tip.setContent(req.getContent());
        tip.setApplySteps(serialize(req.getApplySteps()));
        tip.setQuestion(req.getQuestion());
        tip.setOptions(serialize(req.getOptions()));
        tip.setCorrectAnswer(req.getCorrectAnswer());
        tip.setExplanation(req.getExplanation());
        tip.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
    }

    private String serialize(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Lỗi serialize tip data: {}", e.getMessage());
            return null;
        }
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            JsonNode node = objectMapper.readTree(json);
            List<String> result = new ArrayList<>();
            if (node.isArray()) {
                node.forEach(item -> result.add(item.asText()));
            }
            return result;
        } catch (Exception e) {
            log.warn("Lỗi parse tip JSON: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private GrammarTipResponse toResponse(GrammarTip t) {
        return GrammarTipResponse.builder()
                .id(t.getId())
                .topicId(t.getTopic().getId())
                .title(t.getTitle())
                .content(t.getContent())
                .applySteps(parseStringList(t.getApplySteps()))
                .question(t.getQuestion())
                .options(parseStringList(t.getOptions()))
                .correctAnswer(t.getCorrectAnswer())
                .explanation(t.getExplanation())
                .displayOrder(t.getDisplayOrder())
                .status(t.getStatus().name())
                .build();
    }
}