package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.TopicCreateRequest;
import com.englishlearning.backend.dto.response.TopicResponse;
import com.englishlearning.backend.entity.Topic;
import com.englishlearning.backend.entity.User;
import com.englishlearning.backend.enums.ListeningLessonStatus;
import com.englishlearning.backend.enums.TopicStatus;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.ListeningLessonRepository;
import com.englishlearning.backend.repository.TopicRepository;
import com.englishlearning.backend.repository.UserRepository;
import com.englishlearning.backend.service.FileStorageService;
import com.englishlearning.backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ListeningLessonRepository listeningLessonRepository;
    @Override
    public TopicResponse create(
            Long adminId,
            TopicCreateRequest request
    ) {

        User admin = getUser(adminId);

        Topic topic = new Topic();

        topic.setTitle(request.getTitle().trim());
        topic.setDescription(request.getDescription());

        MultipartFile image = request.getTopicImage();

        if (image != null && !image.isEmpty()) {

            String imageUrl =
                    fileStorageService.storeTopicImage(image);

            topic.setTopicImage(imageUrl);
        }


        topic.setStatus(TopicStatus.HIDDEN);

        topic.setCreatedBy(admin);

        Topic savedTopic =
                topicRepository.save(topic);

        return toResponse(savedTopic);
    }

    @Override
    public TopicResponse update(
            Long adminId,
            Long topicId,
            TopicCreateRequest request
    ) {

        getUser(adminId);

        Topic topic = getTopic(topicId);

        topic.setTitle(request.getTitle().trim());
        topic.setDescription(request.getDescription());

        MultipartFile image = request.getTopicImage();

        if (image != null && !image.isEmpty()) {

            String imageUrl =
                    fileStorageService.storeTopicImage(image);

            topic.setTopicImage(imageUrl);
        }

        Topic updatedTopic =
                topicRepository.save(topic);

        return toResponse(updatedTopic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getAll() {

        return topicRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public TopicResponse hide(
            Long adminId,
            Long topicId
    ) {

        getUser(adminId);

        Topic topic = getTopic(topicId);

        topic.setStatus(TopicStatus.HIDDEN);

        Topic savedTopic =
                topicRepository.save(topic);

        return toResponse(savedTopic);
    }

    @Override
    public TopicResponse publish(
            Long adminId,
            Long topicId
    ) {

        getUser(adminId);

        Topic topic = getTopic(topicId);

        topic.setStatus(TopicStatus.PUBLISHED);

        Topic savedTopic =
                topicRepository.save(topic);

        return toResponse(savedTopic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getPublishedTopics() {

        return topicRepository
                .findAllByStatusOrderByCreatedAtDesc(
                        TopicStatus.PUBLISHED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TopicResponse getById(Long topicId) {

        Topic topic = getTopic(topicId);

        return toResponse(topic);
    }

    private User getUser(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy người dùng"
                        )
                );
    }

    private Topic getTopic(Long topicId) {

        return topicRepository.findById(topicId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy topic"
                        )
                );
    }
    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getTopicsForStudent(String sortBy) {

        // Lấy tất cả topic đã publish
        List<Topic> topics = topicRepository.findAllByStatus(TopicStatus.PUBLISHED);

        // Sort
        if ("newest".equals(sortBy)) {
            topics.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        } else if ("oldest".equals(sortBy)) {
            topics.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
        }

        return topics.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getTopicsForStudent() {

        List<Topic> topics = topicRepository.findAllByStatus(TopicStatus.PUBLISHED);

        return topics.stream()
                .map(this::toStudentResponse) // Dùng method riêng
                .collect(Collectors.toList());
    }

    private TopicResponse toResponse(
            Topic topic
    ) {
        int lessonCount = topic.getListeningLessons() != null ?
                topic.getListeningLessons().size() : 0;
        return TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .topicImage(topic.getTopicImage())
                .status(topic.getStatus())
                .lessonCount(lessonCount)
                .createdById(
                        topic.getCreatedBy().getId()
                )
                .createdByName(
                        topic.getCreatedBy().getFullName()
                )
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }
    private TopicResponse toStudentResponse(Topic topic) {

        // Đếm bài học đã publish
        long lessonCount = listeningLessonRepository.countByTopicIdAndStatus(
                topic.getId(),
                ListeningLessonStatus.PUBLISHED
        );

        return TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .topicImage(topic.getTopicImage())
                .status(topic.getStatus())
                .lessonCount((int) lessonCount)
                .createdById(topic.getCreatedBy().getId())
                .createdByName(topic.getCreatedBy().getFullName())
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }
}