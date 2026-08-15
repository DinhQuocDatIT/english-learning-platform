package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.SaveVocabularyRequest;
import com.englishlearning.backend.dto.response.SavedVocabularyResponse;
import com.englishlearning.backend.dto.response.VocabularyMeaningResponse;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.entity.StudentVocabulary;
import com.englishlearning.backend.entity.Vocabulary;
import com.englishlearning.backend.enums.LearningStatus;
import com.englishlearning.backend.exception.DuplicateException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.exception.UnauthorizedException;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.repository.StudentVocabularyRepository;
import com.englishlearning.backend.repository.VocabularyRepository;
import com.englishlearning.backend.service.StudentVocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentVocabularyServiceImpl
        implements StudentVocabularyService {

    private final StudentVocabularyRepository studentVocabularyRepository;
    private final StudentRepository studentRepository;
    private final VocabularyRepository vocabularyRepository;


    @Override
    @Transactional
    public SavedVocabularyResponse saveVocabulary(
            Long userId,
            SaveVocabularyRequest request
    ) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy student của user"
                        )
                );
        Vocabulary vocabulary = vocabularyRepository
                .findById(request.getVocabularyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy vocabulary"
                        )
                );
        boolean exists =
                studentVocabularyRepository
                        .existsByStudentIdAndVocabularyId(
                                student.getId(),
                                vocabulary.getId()
                        );

        if (exists) {
            throw new DuplicateException(
                    "Từ vựng đã được lưu trước đó"
            );
        }

        StudentVocabulary studentVocabulary =
                new StudentVocabulary();

        studentVocabulary.setStudent(student);
        studentVocabulary.setVocabulary(vocabulary);
        studentVocabulary.setLearningStatus(
                LearningStatus.NOT_LEARNED
        );

        studentVocabulary.setReviewCount(0);

        StudentVocabulary saved =
                studentVocabularyRepository.save(
                        studentVocabulary
                );
        return mapToResponse(saved);
    }
    @Override
    @Transactional(readOnly = true)
    public List<SavedVocabularyResponse> getAll(
            Long userId
    ) {

        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy student của user"
                        )
                );

        return studentVocabularyRepository
                .findByStudentId(student.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    @Transactional(readOnly = true)
    public List<SavedVocabularyResponse> getByStatus(
            Long userId,
            LearningStatus status
    ) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy student của user"
                        )
                );
        return studentVocabularyRepository
                .findByStudentIdAndLearningStatus(
                        student.getId(),
                        status
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public SavedVocabularyResponse updateStatus(
            Long userId,
            Long studentVocabularyId,
            LearningStatus status
    ) {

        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy student của user"
                        )
                );

        StudentVocabulary studentVocabulary =
                studentVocabularyRepository
                        .findById(studentVocabularyId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy từ vựng đã lưu"
                                )
                        );

        // Kiểm tra từ này có thuộc student hiện tại không
        if (!studentVocabulary
                .getStudent()
                .getId()
                .equals(student.getId())) {

            throw new UnauthorizedException(
                    "Bạn không có quyền cập nhật từ vựng này"
            );
        }

        studentVocabulary.setLearningStatus(status);

        StudentVocabulary updated =
                studentVocabularyRepository.save(studentVocabulary);

        return mapToResponse(updated);
    }

    private SavedVocabularyResponse mapToResponse(
            StudentVocabulary studentVocabulary
    ) {

        Vocabulary vocabulary =
                studentVocabulary.getVocabulary();

        List<VocabularyMeaningResponse> meanings =
                vocabulary.getMeanings()
                        .stream()
                        .map(meaning ->
                                VocabularyMeaningResponse.builder()
                                        .partOfSpeech(meaning.getPartOfSpeech())
                                        .meaning(meaning.getMeaning())
                                        .example(meaning.getExample())
                                        .build()
                        )
                        .toList();

        return SavedVocabularyResponse.builder()
                .id(studentVocabulary.getId())
                .vocabularyId(vocabulary.getId())
                .word(vocabulary.getWord())
                .pronunciation(vocabulary.getPronunciation())
                .learningStatus(studentVocabulary.getLearningStatus())
                .reviewCount(studentVocabulary.getReviewCount())
                .savedAt(studentVocabulary.getSavedAt())
                .lastReviewedAt(studentVocabulary.getLastReviewedAt())
                .meanings(meanings)
                .build();
    }
}