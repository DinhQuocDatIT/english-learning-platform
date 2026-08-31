package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.ListeningSentenceFeedbackRequest;
import com.englishlearning.backend.dto.response.ListeningSentenceFeedbackResponse;
import com.englishlearning.backend.entity.ListeningSentence;
import com.englishlearning.backend.entity.ListeningSentenceFeedback;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.ListeningSentenceFeedbackRepository;
import com.englishlearning.backend.repository.ListeningSentenceRepository;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.service.ListeningSentenceFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ListeningSentenceFeedbackServiceImpl implements ListeningSentenceFeedbackService {

    private final ListeningSentenceFeedbackRepository feedbackRepository;
    private final StudentRepository studentRepository;
    private final ListeningSentenceRepository sentenceRepository;

    @Override
    public ListeningSentenceFeedbackResponse create(Long userId, ListeningSentenceFeedbackRequest request) {
        Student student = getStudentByUserId(userId);
        ListeningSentence sentence = getSentence(request.getListeningSentenceId());



        ListeningSentenceFeedback feedback = ListeningSentenceFeedback.builder()
                .student(student)
                .listeningSentence(sentence)
                .content(request.getContent())
                .build();

        ListeningSentenceFeedback saved = feedbackRepository.save(feedback);
        return toResponse(saved);
    }

    @Override
    public ListeningSentenceFeedbackResponse update(Long userId, Long feedbackId, ListeningSentenceFeedbackRequest request) {
        Student student = getStudentByUserId(userId);
        ListeningSentenceFeedback feedback = getFeedback(feedbackId);

        // Kiểm tra quyền sở hữu
        if (!feedback.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa phản hồi này");
        }

        feedback.setContent(request.getContent());
        ListeningSentenceFeedback updated = feedbackRepository.save(feedback);
        return toResponse(updated);
    }

    @Override
    public void delete(Long userId, Long feedbackId) {
        Student student = getStudentByUserId(userId);
        ListeningSentenceFeedback feedback = getFeedback(feedbackId);

        // Kiểm tra quyền sở hữu
        if (!feedback.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa phản hồi này");
        }

        feedbackRepository.delete(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public ListeningSentenceFeedbackResponse getByStudentAndSentence(Long userId, Long sentenceId) {
        Student student = getStudentByUserId(userId);
        getSentence(sentenceId);

        return feedbackRepository
                .findByStudentIdAndListeningSentenceId(student.getId(), sentenceId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningSentenceFeedbackResponse> getMyFeedbacks(Long userId) {
        Student student = getStudentByUserId(userId);
        return feedbackRepository
                .findAllByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningSentenceFeedbackResponse> getBySentence(Long sentenceId) {
        getSentence(sentenceId);
        return feedbackRepository
                .findAllByListeningSentenceIdOrderByCreatedAtDesc(sentenceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningSentenceFeedbackResponse> getByLesson(Long lessonId) {
        return feedbackRepository
                .findAllByLessonId(lessonId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningSentenceFeedbackResponse> getMyFeedbacksByLesson(Long userId, Long lessonId) {
        Student student = getStudentByUserId(userId);
        return feedbackRepository
                .findAllByStudentIdAndLessonId(student.getId(), lessonId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy student với userId: " + userId));
    }

    private ListeningSentence getSentence(Long sentenceId) {
        return sentenceRepository.findById(sentenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu nghe với id: " + sentenceId));
    }

    private ListeningSentenceFeedback getFeedback(Long feedbackId) {
        return feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phản hồi với id: " + feedbackId));
    }

    private ListeningSentenceFeedbackResponse toResponse(ListeningSentenceFeedback feedback) {
        return ListeningSentenceFeedbackResponse.builder()
                .id(feedback.getId())
                .studentId(feedback.getStudent().getId())
                .studentName(feedback.getStudent().getUser().getFullName())
                .listeningSentenceId(feedback.getListeningSentence().getId())
                .listeningSentenceText(feedback.getListeningSentence().getEnglishText())
                .content(feedback.getContent())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}