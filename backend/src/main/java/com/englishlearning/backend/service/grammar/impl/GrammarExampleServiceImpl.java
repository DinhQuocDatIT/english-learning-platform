package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.request.GrammarExampleRequest;
import com.englishlearning.backend.dto.grammar.response.GrammarExampleResponse;
import com.englishlearning.backend.entity.GrammarExample;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.GrammarExampleRepository;
import com.englishlearning.backend.repository.GrammarTopicRepository;
import com.englishlearning.backend.service.grammar.GrammarExampleService;
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
public class GrammarExampleServiceImpl implements GrammarExampleService {

    private final GrammarExampleRepository exampleRepository;
    private final GrammarTopicRepository topicRepository;

    // ===== PUBLIC =====
    @Override
    @Transactional(readOnly = true)
    public List<GrammarExampleResponse> getPublishedExamples(Long topicId) {
        return exampleRepository
                .findByTopicIdAndStatusOrderByDisplayOrderAsc(topicId, GrammarStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== TEACHER =====
    @Override
    @Transactional(readOnly = true)
    public List<GrammarExampleResponse> getExamplesForEdit(Long teacherId, Long topicId) {
        GrammarTopic topic = findTopicAndCheckOwner(teacherId, topicId);
        return exampleRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GrammarExampleResponse createExample(Long teacherId, GrammarExampleRequest request) {
        GrammarTopic topic = findTopicAndCheckOwner(teacherId, request.getTopicId());

        if (topic.getStatus() != GrammarStatus.DRAFT
                && topic.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException(
                    "Chỉ có thể thêm ví dụ khi chủ điểm ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        GrammarExample example = new GrammarExample();
        example.setTopic(topic);
        example.setSentenceEn(request.getSentenceEn().trim());
        example.setSentenceVi(request.getSentenceVi());
        example.setNote(request.getNote());
        example.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        example.setStatus(GrammarStatus.DRAFT);

        return toResponse(exampleRepository.save(example));
    }

    @Override
    public GrammarExampleResponse updateExample(Long teacherId, Long exampleId,
                                                GrammarExampleRequest request) {
        GrammarExample example = exampleRepository.findById(exampleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví dụ"));

        if (!example.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền sửa ví dụ này");
        }

        if (example.getStatus() != GrammarStatus.DRAFT
                && example.getStatus() != GrammarStatus.REJECTED) {
            throw new BusinessException("Chỉ có thể sửa ví dụ ở trạng thái NHÁP hoặc TỪ CHỐI");
        }

        example.setSentenceEn(request.getSentenceEn().trim());
        example.setSentenceVi(request.getSentenceVi());
        example.setNote(request.getNote());
        if (request.getDisplayOrder() != null) {
            example.setDisplayOrder(request.getDisplayOrder());
        }

        return toResponse(exampleRepository.save(example));
    }

    @Override
    public void deleteExample(Long teacherId, Long exampleId) {
        GrammarExample example = exampleRepository.findById(exampleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví dụ"));

        if (!example.getTopic().getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền xóa ví dụ này");
        }

        if (example.getStatus() != GrammarStatus.DRAFT) {
            throw new BusinessException("Chỉ có thể xóa ví dụ ở trạng thái NHÁP");
        }

        exampleRepository.delete(example);
    }

    // ===== ADMIN =====
    @Override
    @Transactional(readOnly = true)
    public List<GrammarExampleResponse> getExamplesForAdmin(Long topicId) {
        return exampleRepository.findByTopicIdOrderByDisplayOrderAsc(topicId)
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

    private GrammarExampleResponse toResponse(GrammarExample e) {
        return GrammarExampleResponse.builder()
                .id(e.getId())
                .topicId(e.getTopic().getId())
                .sentenceEn(e.getSentenceEn())
                .sentenceVi(e.getSentenceVi())
                .note(e.getNote())
                .displayOrder(e.getDisplayOrder())
                .status(e.getStatus().name())
                .build();
    }
}