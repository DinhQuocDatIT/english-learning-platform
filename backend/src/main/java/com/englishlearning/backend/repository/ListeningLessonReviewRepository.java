package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ListeningLessonReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListeningLessonReviewRepository extends JpaRepository<ListeningLessonReview, Long> {

    List<ListeningLessonReview> findByListeningLessonIdOrderByCreatedAtDesc(Long listeningLessonId);

    List<ListeningLessonReview> findByListeningLessonIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long listeningLessonId);
}
