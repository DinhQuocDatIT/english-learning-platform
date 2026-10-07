package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.SaveVocabularyRequest;
import com.englishlearning.backend.dto.request.VocabularyMeaningRequest;
import com.englishlearning.backend.dto.response.SavedVocabularyResponse;
import com.englishlearning.backend.dto.response.VocabularyMeaningResponse;
import com.englishlearning.backend.entity.Student;
import com.englishlearning.backend.entity.StudentVocabulary;
import com.englishlearning.backend.entity.StudentVocabularyMeaning;
import com.englishlearning.backend.enums.LearningStatus;
import com.englishlearning.backend.exception.DuplicateException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.exception.UnauthorizedException;
import com.englishlearning.backend.repository.StudentRepository;
import com.englishlearning.backend.repository.StudentVocabularyRepository;
import com.englishlearning.backend.service.StudentVocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentVocabularyServiceImpl
        implements StudentVocabularyService {

    private final StudentVocabularyRepository studentVocabularyRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public SavedVocabularyResponse saveVocabulary(
            Long userId,
            SaveVocabularyRequest request
    ) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy student của user"
                ));

        boolean exists = studentVocabularyRepository
                .existsByStudentIdAndWordIgnoreCase(
                        student.getId(),
                        request.getWord().trim()
                );

        if (exists) {
            throw new DuplicateException("Từ vựng đã được lưu trước đó");
        }

        StudentVocabulary sv = new StudentVocabulary();
        sv.setStudent(student);
        sv.setWord(request.getWord().trim());
        sv.setPronunciation(request.getPronunciation());
        sv.setLearningStatus(LearningStatus.NOT_LEARNED);

        List<StudentVocabularyMeaning> meanings = new ArrayList<>();
        for (VocabularyMeaningRequest m : request.getMeanings()) {
            StudentVocabularyMeaning svm = new StudentVocabularyMeaning();
            svm.setStudentVocabulary(sv);
            svm.setPartOfSpeech(m.getPartOfSpeech());
            svm.setMeaning(m.getMeaning());
            svm.setExample(m.getExample());
            meanings.add(svm);
        }
        sv.setMeanings(meanings);

        StudentVocabulary saved = studentVocabularyRepository.save(sv);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedVocabularyResponse> getAll(Long userId) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy student của user"
                ));

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
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy student của user"
                ));

        return studentVocabularyRepository
                .findByStudentIdAndLearningStatus(student.getId(), status)
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
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy student của user"
                ));

        StudentVocabulary sv = studentVocabularyRepository
                .findById(studentVocabularyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy từ vựng đã lưu"
                ));

        if (!sv.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException(
                    "Bạn không có quyền cập nhật từ vựng này"
            );
        }

        sv.setLearningStatus(status);
        StudentVocabulary updated = studentVocabularyRepository.save(sv);
        return mapToResponse(updated);
    }
    @Override
    @Transactional
    public void delete(Long userId, Long studentVocabularyId) {
        Student student = studentRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy student của user"
                ));

        StudentVocabulary sv = studentVocabularyRepository
                .findById(studentVocabularyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy từ vựng đã lưu"
                ));

        if (!sv.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException(
                    "Bạn không có quyền xóa từ vựng này"
            );
        }

        studentVocabularyRepository.delete(sv);
    }
    private SavedVocabularyResponse mapToResponse(StudentVocabulary sv) {
        List<VocabularyMeaningResponse> meanings = sv.getMeanings()
                .stream()
                .map(m -> VocabularyMeaningResponse.builder()
                        .partOfSpeech(m.getPartOfSpeech())
                        .meaning(m.getMeaning())
                        .example(m.getExample())
                        .build())
                .toList();

        return SavedVocabularyResponse.builder()
                .id(sv.getId())
                .word(sv.getWord())
                .pronunciation(sv.getPronunciation())
                .learningStatus(sv.getLearningStatus())
                .savedAt(sv.getSavedAt())
                .meanings(meanings)
                .build();
    }
}