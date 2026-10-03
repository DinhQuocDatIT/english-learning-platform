package com.englishlearning.backend.service.grammar.impl;

import com.englishlearning.backend.dto.grammar.response.GrammarEditRequestResponse;
import com.englishlearning.backend.entity.GrammarTheory;
import com.englishlearning.backend.entity.GrammarTopic;
import com.englishlearning.backend.entity.GrammarTopicEditRequest;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.enums.GrammarEditRequestStatus;
import com.englishlearning.backend.enums.GrammarReviewAction;
import com.englishlearning.backend.enums.GrammarStatus;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.GrammarExampleRepository;
import com.englishlearning.backend.repository.GrammarTheoryRepository;
import com.englishlearning.backend.repository.GrammarTopicEditRequestRepository;
import com.englishlearning.backend.repository.GrammarTopicRepository;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.grammar.GrammarEditRequestService;
import com.englishlearning.backend.service.grammar.GrammarTopicReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GrammarEditRequestServiceImpl implements GrammarEditRequestService {

    private final GrammarTopicEditRequestRepository editRequestRepository;
    private final GrammarTopicRepository topicRepository;
    private final GrammarTheoryRepository theoryRepository;
    private final GrammarExampleRepository exampleRepository;
    private final UserRepository userRepository;
    private final GrammarTopicReviewService reviewService;

    // =====================================================
    // TEACHER
    // =====================================================

    @Override
    public GrammarEditRequestResponse createRequest(Long teacherId, Long topicId, String reason) {
        // 1. Validate reason
        if (reason == null || reason.trim().isEmpty()) {
            throw new BusinessException("Vui lòng nhập lý do chỉnh sửa");
        }

        // 2. Lấy topic
        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        // 3. Check quyền sở hữu
        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền gửi yêu cầu cho chủ điểm này");
        }

        // 4. Chỉ cho gửi khi topic đang PUBLISHED
        if (topic.getStatus() != GrammarStatus.PUBLISHED) {
            throw new BusinessException(
                    "Chỉ có thể gửi yêu cầu chỉnh sửa khi chủ điểm đang được publish");
        }

        // 5. Check không có yêu cầu PENDING nào
        boolean hasPending = editRequestRepository.existsByTopicIdAndStatus(
                topicId, GrammarEditRequestStatus.PENDING);
        if (hasPending) {
            throw new BusinessException(
                    "Đã có yêu cầu chỉnh sửa đang chờ duyệt. Vui lòng đợi admin xử lý.");
        }

        // 6. Tạo request
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy teacher"));

        GrammarTopicEditRequest request = GrammarTopicEditRequest.builder()
                .topic(topic)
                .requestedBy(teacher)
                .reason(reason.trim())
                .status(GrammarEditRequestStatus.PENDING)
                .build();

        GrammarTopicEditRequest saved = editRequestRepository.save(request);

        // 7. Ghi log history
        reviewService.log(topic, GrammarReviewAction.REQUEST_EDIT,
                "Lý do: " + reason.trim(), teacher);

        log.info("📝 Teacher {} gửi yêu cầu sửa topic id={}, reason={}",
                teacherId, topicId, reason);

        return toResponse(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarEditRequestResponse> getRequestsByTopicForTeacher(
            Long teacherId, Long topicId) {

        GrammarTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ điểm"));

        // Check quyền
        if (!topic.getCreatedBy().getId().equals(teacherId)) {
            throw new BusinessException("Bạn không có quyền xem yêu cầu của chủ điểm này");
        }

        return editRequestRepository.findByTopicIdOrderByCreatedAtDesc(topicId)
                .stream()
                .map(r -> toResponse(r, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPendingRequest(Long topicId) {
        return editRequestRepository.existsByTopicIdAndStatus(
                topicId, GrammarEditRequestStatus.PENDING);
    }

    // =====================================================
    // ADMIN
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<GrammarEditRequestResponse> getAllRequests(String status) {
        List<GrammarTopicEditRequest> list;

        if (status == null || status.isBlank()) {
            list = editRequestRepository.findAll();
        } else {
            try {
                GrammarEditRequestStatus enumStatus =
                        GrammarEditRequestStatus.valueOf(status.toUpperCase());
                list = editRequestRepository.findByStatusOrderByCreatedAtDesc(enumStatus);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Status không hợp lệ: " + status);
            }
        }

        return list.stream()
                .map(r -> toResponse(r, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countPending() {
        return editRequestRepository.countByStatus(GrammarEditRequestStatus.PENDING);
    }

    @Override
    public GrammarEditRequestResponse approveRequest(Long adminId, Long requestId) {
        GrammarTopicEditRequest request = editRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu"));

        // Chỉ duyệt được yêu cầu PENDING
        if (request.getStatus() != GrammarEditRequestStatus.PENDING) {
            throw new BusinessException("Yêu cầu này đã được xử lý rồi");
        }

        // Update request
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy admin"));

        request.setStatus(GrammarEditRequestStatus.APPROVED);
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());
        GrammarTopicEditRequest saved = editRequestRepository.save(request);

        // ✅ Chuyển topic về DRAFT để teacher sửa
        GrammarTopic topic = request.getTopic();
        topic.setStatus(GrammarStatus.DRAFT);
        topicRepository.save(topic);

        // Chuyển tất cả theory của topic về DRAFT (nếu đang PUBLISHED)
        List<GrammarTheory> theories = theoryRepository
                .findByTopicIdOrderByDisplayOrderAsc(topic.getId());
        for (GrammarTheory theory : theories) {
            if (theory.getStatus() == GrammarStatus.PUBLISHED) {
                theory.setStatus(GrammarStatus.DRAFT);
            }
        }
        theoryRepository.saveAll(theories);

        // ✅ Chuyển tất cả example của topic về DRAFT (nếu đang PUBLISHED)
        exampleRepository.updateStatusByTopicAndFromStatus(
                topic.getId(), GrammarStatus.PUBLISHED, GrammarStatus.DRAFT);

        // Ghi log
        reviewService.log(topic, GrammarReviewAction.APPROVE_EDIT,
                "Đồng ý cho chỉnh sửa. Lý do: " + request.getReason(), admin);

        log.info("✅ Admin {} duyệt yêu cầu sửa requestId={}, topicId={}",
                adminId, requestId, topic.getId());

        return toResponse(saved, false);
    }

    @Override
    public GrammarEditRequestResponse rejectRequest(Long adminId, Long requestId, String note) {
        GrammarTopicEditRequest request = editRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu"));

        if (request.getStatus() != GrammarEditRequestStatus.PENDING) {
            throw new BusinessException("Yêu cầu này đã được xử lý rồi");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy admin"));

        request.setStatus(GrammarEditRequestStatus.REJECTED);
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewNote(note != null ? note.trim() : null);
        GrammarTopicEditRequest saved = editRequestRepository.save(request);

        // Ghi log
        String logReason = "Từ chối yêu cầu sửa"
                + (note != null && !note.isBlank() ? ". Lý do: " + note.trim() : "");
        reviewService.log(request.getTopic(), GrammarReviewAction.REJECT_EDIT,
                logReason, admin);

        log.info("❌ Admin {} từ chối yêu cầu sửa requestId={}", adminId, requestId);

        return toResponse(saved, false);
    }

    // =====================================================
    // MAPPER
    // =====================================================

    private GrammarEditRequestResponse toResponse(GrammarTopicEditRequest r,
                                                  boolean hasPendingRequest) {
        return GrammarEditRequestResponse.builder()
                .id(r.getId())
                .topicId(r.getTopic().getId())
                .topicName(r.getTopic().getName())
                .topicSlug(r.getTopic().getSlug())
                .requestedById(r.getRequestedBy().getId())
                .requestedByName(r.getRequestedBy().getFullName())
                .reason(r.getReason())
                .status(r.getStatus().name())
                .reviewedById(r.getReviewedBy() != null ? r.getReviewedBy().getId() : null)
                .reviewedByName(r.getReviewedBy() != null
                        ? r.getReviewedBy().getFullName() : null)
                .reviewedAt(r.getReviewedAt())
                .reviewNote(r.getReviewNote())
                .createdAt(r.getCreatedAt())
                .hasPendingRequest(hasPendingRequest)
                .build();
    }
}