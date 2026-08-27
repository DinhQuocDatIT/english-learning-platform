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
import com.englishlearning.backend.repository.LevelRepository;
import com.englishlearning.backend.repository.ListeningLessonRepository;
import com.englishlearning.backend.repository.TopicRepository;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.FileStorageService;
import com.englishlearning.backend.service.ListeningLessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // Mặc định tạo là DRAFT
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

        // Chỉ người tạo mới được sửa
        if (!lesson.getCreatedBy()
                .getId()
                .equals(teacherId)) {

            throw new RuntimeException(
                    "Bạn không có quyền chỉnh sửa bài nghe này"
            );
        }

        // Chỉ DRAFT mới được sửa
        if (lesson.getStatus()
                != ListeningLessonStatus.DRAFT) {

            throw new RuntimeException(
                    "Chỉ có thể chỉnh sửa bài nghe đang ở trạng thái Nháp"
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
    // TEACHER - MY LESSONS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getMyLessons(
            Long teacherId
    ) {

        return listeningLessonRepository
                .findAllByCreatedByIdOrderByCreatedAtDesc(
                        teacherId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }
    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getMyLessonsByTopic(Long teacherId, Long topicId) {
        getUser(teacherId);
        getTopic(topicId);
        return listeningLessonRepository
                .findAllByCreatedByIdAndTopicIdOrderByCreatedAtDesc(teacherId, topicId)
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

        if (lesson.getStatus()
                != ListeningLessonStatus.DRAFT) {

            throw new RuntimeException(
                    "Chỉ có thể gửi bài nghe đang ở trạng thái Nháp"
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
    // ADMIN - GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getAll() {

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
    // GET BY TOPIC
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getByTopic(
            Long topicId
    ) {

        // Kiểm tra Topic tồn tại
        getTopic(topicId);

        return listeningLessonRepository
                .findAllByTopicIdOrderByCreatedAtDesc(
                        topicId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET PUBLISHED BY TOPIC
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ListeningLessonResponse> getPublishedByTopic(
            Long topicId
    ) {

        getTopic(topicId);

        return listeningLessonRepository
                .findAllByTopicIdAndStatusOrderByCreatedAtDesc(
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

    private ListeningLessonResponse toResponse(
            ListeningLesson lesson
    ) {

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
                .build();
    }
}