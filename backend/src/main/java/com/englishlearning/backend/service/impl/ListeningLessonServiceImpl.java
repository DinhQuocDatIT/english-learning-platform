package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.ListeningLessonCreateRequest;
import com.englishlearning.backend.dto.request.UpdateListeningLessonRequest;
import com.englishlearning.backend.dto.response.ListeningLessonResponse;
import com.englishlearning.backend.entity.Level;
import com.englishlearning.backend.entity.ListeningLesson;
import com.englishlearning.backend.entity.Topic;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.enums.ListeningLessonStatus;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.*;
import com.englishlearning.backend.service.FileStorageService;
import com.englishlearning.backend.service.ListeningLessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ListeningLessonServiceImpl
        implements ListeningLessonService {

    private final ListeningLessonRepository listeningLessonRepository;
    private final TopicRepository topicRepository;
    private final LevelRepository levelRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ListeningAnswerRepository listeningAnswerRepository;
    private final ListeningSentenceRepository listeningSentenceRepository;
    private final ListeningLessonReviewRepository listeningLessonReviewRepository;

    // =====================================================
    // TEACHER - CREATE
    // =====================================================

    @Override
    public ListeningLessonResponse create(
            Long teacherId,
            ListeningLessonCreateRequest request
    ) {

        User teacher = getUser(teacherId);

        Topic topic = getTopic(request.getTopicId());

        Level level = getLevel(request.getLevelId());

        ListeningLesson lesson = new ListeningLesson();

        lesson.setTopic(topic);
        lesson.setLevel(level);
        lesson.setCreatedBy(teacher);

        lesson.setTitle(
                request.getTitle().trim()
        );

        lesson.setDescription(
                request.getDescription()
        );
        String lessonImage =
                fileStorageService.storeLessonImage(
                        request.getLessonImage()
                );

        lesson.setLessonImage(lessonImage);
        lesson.setIsPremium(
                request.getIsPremium() != null
                        ? request.getIsPremium()
                        : false
        );

        lesson.setStatus(
                ListeningLessonStatus.DRAFT
        );

        ListeningLesson saved =
                listeningLessonRepository.save(lesson);

        return toResponse(saved);
    }

    // =====================================================
    // TEACHER - UPDATE
    // =====================================================

    @Override
    public ListeningLessonResponse update(
            Long teacherId,
            Long lessonId,
            UpdateListeningLessonRequest request
    ) {

        ListeningLesson lesson =
                getLesson(lessonId);

        if (!lesson.getCreatedBy()
                .getId()
                .equals(teacherId)) {

            throw new RuntimeException(
                    "Bạn không có quyền chỉnh sửa bài nghe này"
            );
        }

        if (lesson.getStatus() != ListeningLessonStatus.DRAFT &&
                lesson.getStatus() != ListeningLessonStatus.REJECTED) {

            throw new RuntimeException(
                    "Chỉ có thể chỉnh sửa bài nghe đang ở trạng thái Nháp hoặc Từ chối"
            );
        }

        Topic topic =
                getTopic(request.getTopicId());

        Level level =
                getLevel(request.getLevelId());

        lesson.setTopic(topic);
        lesson.setLevel(level);

        lesson.setTitle(
                request.getTitle().trim()
        );

        lesson.setDescription(
                request.getDescription()
        );

        if (request.getLessonImage() != null &&
                !request.getLessonImage().isEmpty()) {

            String lessonImage =
                    fileStorageService.storeLessonImage(
                            request.getLessonImage()
                    );

            lesson.setLessonImage(lessonImage);
        }


        lesson.setIsPremium(
                request.getIsPremium() != null
                        ? request.getIsPremium()
                        : false
        );

        ListeningLesson updated =
                listeningLessonRepository.save(lesson);

        return toResponse(updated);
    }

    // =====================================================
    // TEACHER - HARD DELETE (XÓA CỨNG)
    // Chỉ dành cho DRAFT và REJECTED
    // =====================================================

    @Override
    public void hardDelete(Long teacherId, Long lessonId) {

        ListeningLesson lesson = getLesson(lessonId);

        // Kiểm tra quyền: chỉ người tạo mới được xóa
        if (!lesson.getCreatedBy().getId().equals(teacherId)) {
            throw new RuntimeException("Bạn không có quyền xóa bài nghe này");
        }

        // Cho phép xóa khi ở trạng thái DRAFT hoặc REJECTED
        if (lesson.getStatus() != ListeningLessonStatus.DRAFT &&
                lesson.getStatus() != ListeningLessonStatus.REJECTED) {
            throw new RuntimeException(
                    "Chỉ có thể xóa bài nghe đang ở trạng thái Nháp (DRAFT) hoặc Từ chối (REJECTED)"
            );
        }

        // 1. Xóa tất cả câu hỏi con trước
        listeningSentenceRepository.deleteByListeningLessonId(lessonId);

        // 2. Xóa tất cả review liên quan
        listeningLessonReviewRepository.deleteByListeningLessonId(lessonId);

        // 3. Xóa luôn bài học khỏi database
        listeningLessonRepository.delete(lesson);
    }

    // =====================================================
    // ADMIN - SOFT DELETE (XÓA MỀM - ẨN BÀI)
    // Dành cho APPROVED và PUBLISHED
    // =====================================================
    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getByTopicForAdmin(Long topicId) {

        getTopic(topicId);

        // Admin thấy TẤT CẢ bài theo topic, kể cả đã xóa mềm
        return listeningLessonRepository
                .findAllByTopicIdOrderByCreatedAtDesc(topicId) // KHÔNG filter deletedAt
                .stream()
                .map(this::toResponse)
                .toList();
    }
    @Override
    public void softDelete(Long adminId, Long lessonId) {

        getUser(adminId); // Kiểm tra admin tồn tại

        ListeningLesson lesson = getLesson(lessonId);

        // Chỉ cho phép xóa mềm khi ở trạng thái APPROVED hoặc PUBLISHED
        if (lesson.getStatus() != ListeningLessonStatus.APPROVED &&
                lesson.getStatus() != ListeningLessonStatus.PUBLISHED) {
            throw new RuntimeException(
                    "Chỉ có thể ẩn bài nghe đã được duyệt (APPROVED) hoặc đã phát hành (PUBLISHED)"
            );
        }

        // Kiểm tra nếu đã bị xóa mềm rồi thì không xóa nữa
        if (lesson.getDeletedAt() != null) {
            throw new RuntimeException("Bài nghe này đã bị ẩn trước đó");
        }

        // Soft delete: set deletedAt
        lesson.setDeletedAt(LocalDateTime.now());
        listeningLessonRepository.save(lesson);
    }

    // =====================================================
    // ADMIN - RESTORE (PHỤC HỒI BÀI ĐÃ ẨN)
    // =====================================================

    @Override
    public void restore(Long adminId, Long lessonId) {

        getUser(adminId); // Kiểm tra admin tồn tại

        ListeningLesson lesson = getLesson(lessonId);

        // Kiểm tra bài đã bị xóa mềm chưa
        if (lesson.getDeletedAt() == null) {
            throw new RuntimeException("Bài nghe này chưa bị ẩn, không cần phục hồi");
        }

        // Phục hồi: xóa deletedAt
        lesson.setDeletedAt(null);
        listeningLessonRepository.save(lesson);
    }

    // =====================================================
    // ADMIN - GET DELETED LESSONS (LẤY BÀI ĐÃ XÓA MỀM)
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getDeletedLessons() {
        return listeningLessonRepository
                .findAllByDeletedAtIsNotNullOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // TEACHER - MY LESSONS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getMyLessons(
            Long teacherId
    ) {

        return listeningLessonRepository
                .findAllByCreatedByIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        teacherId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // TEACHER - MY LESSONS BY TOPIC
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getMyLessonsByTopic(Long teacherId, Long topicId) {
        getUser(teacherId);
        getTopic(topicId);
        return listeningLessonRepository
                .findAllByCreatedByIdAndTopicIdAndDeletedAtIsNullOrderByCreatedAtDesc(teacherId, topicId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // TEACHER - SUBMIT
    // =====================================================

    @Override
    public ListeningLessonResponse submitForReview(
            Long teacherId,
            Long lessonId
    ) {

        ListeningLesson lesson =
                getLesson(lessonId);

        if (!lesson.getCreatedBy()
                .getId()
                .equals(teacherId)) {

            throw new RuntimeException(
                    "Bạn không có quyền gửi bài nghe này"
            );
        }

        if (lesson.getStatus() != ListeningLessonStatus.DRAFT &&
                lesson.getStatus() != ListeningLessonStatus.REJECTED) {

            throw new RuntimeException(
                    "Chỉ có thể gửi bài nghe đang ở trạng thái Nháp hoặc Từ chối"
            );
        }

        lesson.setStatus(
                ListeningLessonStatus.PENDING
        );

        ListeningLesson saved =
                listeningLessonRepository.save(lesson);

        return toResponse(saved);
    }

    // =====================================================
    // ADMIN - GET ALL (VẪN thấy bài đã xóa mềm)
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getAll() {
        // Admin thấy TẤT CẢ kể cả đã xóa mềm
        return listeningLessonRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // ADMIN - APPROVE
    // =====================================================

    @Override
    public ListeningLessonResponse approve(
            Long adminId,
            Long lessonId
    ) {

        getUser(adminId);

        ListeningLesson lesson =
                getLesson(lessonId);

        if (lesson.getStatus()
                != ListeningLessonStatus.PENDING) {

            throw new RuntimeException(
                    "Chỉ có thể duyệt bài nghe đang chờ duyệt"
            );
        }

        lesson.setStatus(
                ListeningLessonStatus.APPROVED
        );

        ListeningLesson saved =
                listeningLessonRepository.save(lesson);

        return toResponse(saved);
    }

    // =====================================================
    // ADMIN - REJECT
    // =====================================================

    @Override
    public ListeningLessonResponse reject(
            Long adminId,
            Long lessonId
    ) {

        getUser(adminId);

        ListeningLesson lesson =
                getLesson(lessonId);

        if (lesson.getStatus()
                != ListeningLessonStatus.PENDING) {

            throw new RuntimeException(
                    "Chỉ có thể từ chối bài nghe đang chờ duyệt"
            );
        }

        lesson.setStatus(
                ListeningLessonStatus.REJECTED
        );

        ListeningLesson saved =
                listeningLessonRepository.save(lesson);

        return toResponse(saved);
    }

    // =====================================================
    // ADMIN - PUBLISH
    // =====================================================

    @Override
    public ListeningLessonResponse publish(
            Long adminId,
            Long lessonId
    ) {

        getUser(adminId);

        ListeningLesson lesson =
                getLesson(lessonId);

        if (lesson.getStatus()
                != ListeningLessonStatus.APPROVED) {

            throw new RuntimeException(
                    "Chỉ có thể phát hành bài nghe đã được duyệt"
            );
        }

        lesson.setStatus(
                ListeningLessonStatus.PUBLISHED
        );

        ListeningLesson saved =
                listeningLessonRepository.save(lesson);

        return toResponse(saved);
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ListeningLessonResponse getById(
            Long lessonId
    ) {

        ListeningLesson lesson =
                getLesson(lessonId);

        return toResponse(lesson);
    }

    // =====================================================
    // GET BY TOPIC (Student - KHÔNG thấy bài đã xóa mềm)
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getByTopic(
            Long topicId
    ) {

        getTopic(topicId);

        // Student chỉ thấy bài chưa bị xóa mềm
        return listeningLessonRepository
                .findAllByTopicIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        topicId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET PUBLISHED BY TOPIC (Student - KHÔNG thấy bài đã xóa mềm)
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getPublishedByTopic(
            Long topicId
    ) {

        getTopic(topicId);

        // Student chỉ thấy bài PUBLISHED và chưa bị xóa mềm
        return listeningLessonRepository
                .findAllByTopicIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        topicId,
                        ListeningLessonStatus.PUBLISHED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private User getUser(Long userId) {

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy người dùng"
                        )
                );
    }

    private Topic getTopic(Long topicId) {

        return topicRepository
                .findById(topicId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy topic"
                        )
                );
    }

    private Level getLevel(Long levelId) {

        return levelRepository
                .findById(levelId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy level"
                        )
                );
    }

    private ListeningLesson getLesson(
            Long lessonId
    ) {

        return listeningLessonRepository
                .findById(lessonId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy bài nghe"
                        )
                );
    }
    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getAll(ListeningLessonStatus status) {
        List<ListeningLesson> lessons = (status != null)
                ? listeningLessonRepository.findAllByStatusOrderByCreatedAtDesc(status)
                : listeningLessonRepository.findAllByOrderByCreatedAtDesc();

        return lessons.stream()
                .map(this::toResponse)
                .toList();
    }
    private ListeningLessonResponse toResponse(
            ListeningLesson lesson
    ) {

        int studentCount = listeningAnswerRepository
                .countDistinctStudentsByLessonId(lesson.getId());

        return ListeningLessonResponse.builder()
                .id(lesson.getId())
                .topicId(lesson.getTopic().getId())
                .topicTitle(lesson.getTopic().getTitle())
                .levelId(lesson.getLevel().getId())
                .levelName(lesson.getLevel().getName())
                .levelColor(lesson.getLevel().getColor())
                .createdById(lesson.getCreatedBy().getId())
                .createdByName(lesson.getCreatedBy().getFullName())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .status(lesson.getStatus())
                .isPremium(lesson.getIsPremium())
                .lessonImage(lesson.getLessonImage())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .studentCount(studentCount)
                .deletedAt(lesson.getDeletedAt())
                .build();
    }
}