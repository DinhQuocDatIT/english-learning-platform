package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.StudentVocabulary;
import com.englishlearning.backend.enums.LearningStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentVocabularyRepository
        extends JpaRepository<StudentVocabulary, Long> {

    List<StudentVocabulary> findByStudentId(Long studentId);

    List<StudentVocabulary> findByStudentIdAndLearningStatus(
            Long studentId,
            LearningStatus learningStatus
    );

    Optional<StudentVocabulary> findByStudentIdAndVocabularyId(
            Long studentId,
            Long vocabularyId
    );

    boolean existsByStudentIdAndVocabularyId(
            Long studentId,
            Long vocabularyId
    );
}
