package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIEvaluationRepository extends JpaRepository<AIEvaluation, Long> {
    Optional<AIEvaluation> findByAnswerId(Long answerId);
}