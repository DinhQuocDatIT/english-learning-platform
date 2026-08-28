package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.ListeningLessonReviewRequest;
import com.englishlearning.backend.dto.response.ListeningLessonReviewResponse;
import com.englishlearning.backend.entity.ListeningLesson;
import com.englishlearning.backend.entity.ListeningLessonReview;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.ListeningLessonRepository;
import com.englishlearning.backend.repository.ListeningLessonReviewRepository;
import com.englishlearning.backend.service.ListeningLessonReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ListeningLessonReviewServiceImpl implements ListeningLessonReviewService {

    private final ListeningLessonReviewRepository listeningLessonReviewRepository;
    private final ListeningLessonRepository listeningLessonRepository;

    @Override
    public ListeningLessonReviewResponse create(ListeningLessonReviewRequest request) {
        ListeningLesson lesson = getLesson(request.getListeningLessonId());

        // Validate action
        String action = request.getAction().toUpperCase();
        if (!action.equals("APPROVE") && !action.equals("REJECT") && !action.equals("PUBLISH")) {
            throw new RuntimeException("Hành động không hợp lệ. Chỉ chấp nhận: APPROVE, REJECT, PUBLISH");
        }

        ListeningLessonReview review = new ListeningLessonReview();
        review.setListeningLesson(lesson);
        review.setAction(action);
        review.setReason(request.getReason());

        ListeningLessonReview saved = listeningLessonReviewRepository.save(review);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ListeningLessonReviewResponse getById(Long reviewId) {
        return toResponse(getReview(reviewId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonReviewResponse> getByLessonId(Long lessonId) {
        // Kiểm tra lesson tồn tại
        getLesson(lessonId);

        return listeningLessonReviewRepository
                .findByListeningLessonIdAndDeletedAtIsNullOrderByCreatedAtDesc(lessonId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonReviewResponse> getAll() {
        return listeningLessonReviewRepository
                .findAll()
                .stream()
                .filter(review -> review.getDeletedAt() == null)
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void delete(Long reviewId) {
        ListeningLessonReview review = getReview(reviewId);
        review.setDeletedAt(LocalDateTime.now());
        listeningLessonReviewRepository.save(review);
    }

    // ===== HELPERS =====

    private ListeningLesson getLesson(Long lessonId) {
        return listeningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nghe"));
    }

    private ListeningLessonReview getReview(Long reviewId) {
        return listeningLessonReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch sử duyệt"));
    }

    private ListeningLessonReviewResponse toResponse(ListeningLessonReview review) {
        return ListeningLessonReviewResponse.builder()
                .id(review.getId())
                .listeningLessonId(review.getListeningLesson().getId())
                .listeningLessonTitle(review.getListeningLesson().getTitle())
                .action(review.getAction())
                .reason(review.getReason())
                .createdAt(review.getCreatedAt())
                .build();
    }
}