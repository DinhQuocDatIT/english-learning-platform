package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ListeningSentence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ListeningSentenceRepository extends JpaRepository<ListeningSentence, Long> {
    List<ListeningSentence> findByListeningLessonIdOrderBySentenceOrderAsc(Long listeningLessonId);

    boolean existsByListeningLessonIdAndSentenceOrder(Long listeningLessonId, Integer sentenceOrder);

    @Query("SELECT s FROM ListeningSentence s WHERE s.listeningLesson.id = :lessonId ORDER BY s.sentenceOrder ASC")
    List<ListeningSentence> findAllByLessonId(@Param("lessonId") Long lessonId);
    List<ListeningSentence> findByListeningLessonId(Long listeningLessonId);
    long countByListeningLessonId(Long listeningLessonId);
}