package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ListeningSentence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListeningSentenceRepository extends JpaRepository<ListeningSentence, Long> {
    List<ListeningSentence> findByListeningLessonIdOrderBySentenceOrderAsc(Long listeningLessonId);

    boolean existsByListeningLessonIdAndSentenceOrder(Long listeningLessonId, Integer sentenceOrder);
}