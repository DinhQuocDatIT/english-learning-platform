package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarQuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarQuizQuestionRepository extends JpaRepository<GrammarQuizQuestion, Long> {

    List<GrammarQuizQuestion> findByQuizIdOrderByDisplayOrderAsc(Long quizId);

    int countByQuizId(Long quizId);

    @Modifying
    @Query("DELETE FROM GrammarQuizQuestion q WHERE q.quiz.id = :quizId")
    void deleteAllByQuizId(@Param("quizId") Long quizId);
}