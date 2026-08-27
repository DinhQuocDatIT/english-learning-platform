package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.ListeningSentenceRequest;
import com.englishlearning.backend.dto.response.ListeningSentenceResponse;
import com.englishlearning.backend.entity.ListeningLesson;
import com.englishlearning.backend.entity.ListeningSentence;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.ListeningLessonRepository;
import com.englishlearning.backend.repository.ListeningSentenceRepository;
import com.englishlearning.backend.service.ListeningSentenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ListeningSentenceServiceImpl implements ListeningSentenceService {

    private final ListeningSentenceRepository listeningSentenceRepository;
    private final ListeningLessonRepository listeningLessonRepository;

    @Override
    public ListeningSentenceResponse create(ListeningSentenceRequest request) {
        ListeningLesson lesson = getLesson(request.getListeningLessonId());

        // Kiểm tra trùng thứ tự
        if (listeningSentenceRepository.existsByListeningLessonIdAndSentenceOrder(
                request.getListeningLessonId(), request.getSentenceOrder())) {
            throw new RuntimeException("Thứ tự câu đã tồn tại trong bài nghe này");
        }

        ListeningSentence sentence = new ListeningSentence();
        sentence.setListeningLesson(lesson);
        sentence.setEnglishText(request.getEnglishText());
        sentence.setSentenceOrder(request.getSentenceOrder());
        sentence.setVietnameseMeaning(request.getVietnameseMeaning());

        ListeningSentence saved = listeningSentenceRepository.save(sentence);
        return toResponse(saved);
    }

    @Override
    public ListeningSentenceResponse update(Long sentenceId, ListeningSentenceRequest request) {
        ListeningSentence sentence = getSentence(sentenceId);

        // Kiểm tra trùng thứ tự (không tính chính nó)
        if (listeningSentenceRepository.existsByListeningLessonIdAndSentenceOrder(
                request.getListeningLessonId(), request.getSentenceOrder())) {
            throw new RuntimeException("Thứ tự câu đã tồn tại trong bài nghe này");
        }

        sentence.setEnglishText(request.getEnglishText());
        sentence.setSentenceOrder(request.getSentenceOrder());
        sentence.setVietnameseMeaning(request.getVietnameseMeaning());

        ListeningSentence updated = listeningSentenceRepository.save(sentence);
        return toResponse(updated);
    }

    @Override
    public void delete(Long sentenceId) {
        ListeningSentence sentence = getSentence(sentenceId);
        listeningSentenceRepository.delete(sentence);
    }

    @Override
    @Transactional(readOnly = true)
    public ListeningSentenceResponse getById(Long sentenceId) {
        return toResponse(getSentence(sentenceId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningSentenceResponse> getByLessonId(Long lessonId) {
        return listeningSentenceRepository
                .findByListeningLessonIdOrderBySentenceOrderAsc(lessonId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ListeningSentenceResponse> reorderSentences(Long lessonId, List<Long> sentenceIds) {
        List<ListeningSentence> sentences = new ArrayList<>();
        for (int i = 0; i < sentenceIds.size(); i++) {
            ListeningSentence sentence = getSentence(sentenceIds.get(i));
            sentence.setSentenceOrder(i + 1);
            sentences.add(sentence);
        }
        return listeningSentenceRepository.saveAll(sentences)
                .stream()
                .map(this::toResponse)
                .toList();
    }



    private ListeningLesson getLesson(Long lessonId) {
        return listeningLessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nghe"));
    }

    private ListeningSentence getSentence(Long sentenceId) {
        return listeningSentenceRepository.findById(sentenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi"));
    }

    private ListeningSentenceResponse toResponse(ListeningSentence sentence) {
        return ListeningSentenceResponse.builder()
                .id(sentence.getId())
                .listeningLessonId(sentence.getListeningLesson().getId())
                .englishText(sentence.getEnglishText())
                .sentenceOrder(sentence.getSentenceOrder())
                .vietnameseMeaning(sentence.getVietnameseMeaning())
                .createdAt(sentence.getCreatedAt())
                .updatedAt(sentence.getUpdatedAt())
                .build();
    }
}