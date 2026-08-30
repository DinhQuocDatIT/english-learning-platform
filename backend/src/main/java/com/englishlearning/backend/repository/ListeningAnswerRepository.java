package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.ListeningAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListeningAnswerRepository extends JpaRepository<ListeningAnswer, Long> {
    Optional<ListeningAnswer> findByStudentIdAndListeningSentenceId(
            Long studentId,
            Long listeningSentenceId
    );
    List<ListeningAnswer> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<ListeningAnswer> findAllByStudentIdAndIsCorrectTrue(Long studentId);
    long countByStudentIdAndIsCorrectTrue(Long studentId);
    @Query("SELECT a FROM ListeningAnswer a " +
            "WHERE a.student.id = :studentId " +
            "AND a.listeningSentence.listeningLesson.id = :lessonId")
    List<ListeningAnswer> findAllByStudentIdAndLessonId(
            @Param("studentId") Long studentId,
            @Param("lessonId") Long lessonId
    );
}