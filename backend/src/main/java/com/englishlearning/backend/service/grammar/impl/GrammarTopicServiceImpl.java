package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.response.GrammarTheoryResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicDetailResponse;
import com.englishlearning.backend.entity.GrammarTheory;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.GrammarTheoryRepository;
import com.englishlearning.backend.repository.GrammarTopicRepository;
import com.englishlearning.backend.service.grammar.GrammarTopicService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GrammarTopicServiceImpl implements GrammarTopicService {

    private final GrammarTopicRepository topicRepository;
    private final GrammarTheoryRepository theoryRepository;
    private final ObjectMapper objectMapper;

    // =====================================================
    // GET TOPIC DETAIL (kèm lý thuyết PUBLISHED)
    // =====================================================
    @Override
    public GrammarTopicDetailResponse getTopicDetail(Long topicId) {
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        // Chỉ lấy theory đã PUBLISHED
        List<GrammarTheoryResponse> theories = theoryRepository
                .findByTopicIdAndStatusOrderByDisplayOrderAsc(
                        topicId, GrammarStatus.PUBLISHED)
                .stream()
                .map(this::toTheoryResponse)
                .collect(Collectors.toList());

        return GrammarTopicDetailResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .slug(topic.getSlug())
                .description(topic.getDescription())
                .totalQuestions(topic.getTotalQuestions())
                .status(topic.getStatus().name())
                .theories(theories)
                .build();
    }

    // =====================================================
    // MAP THEORY → RESPONSE (parse metadata JSON)
    // =====================================================
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