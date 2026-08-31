package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ListeningSentenceFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListeningSentenceFeedbackRepository extends JpaRepository<ListeningSentenceFeedback, Long> {
    Optional<ListeningSentenceFeedback> findByStudentIdAndListeningSentenceId(Long studentId, Long sentenceId);
    List<ListeningSentenceFeedback> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<ListeningSentenceFeedback> findAllByListeningSentenceIdOrderByCreatedAtDesc(Long sentenceId);
    @Query("SELECT f FROM ListeningSentenceFeedback f " +
            "WHERE f.listeningSentence.listeningLesson.id = :lessonId " +
            "ORDER BY f.createdAt DESC")
    List<ListeningSentenceFeedback> findAllByLessonId(@Param("lessonId") Long lessonId);
    boolean existsByStudentIdAndListeningSentenceId(Long studentId, Long sentenceId);
    @Query("SELECT f FROM ListeningSentenceFeedback f " +
            "WHERE f.student.id = :studentId " +
            "AND f.listeningSentence.listeningLesson.id = :lessonId " +
            "ORDER BY f.createdAt DESC")
    List<ListeningSentenceFeedback> findAllByStudentIdAndLessonId(@Param("studentId") Long studentId,
                                                                  @Param("lessonId") Long lessonId);
}