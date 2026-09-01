package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIErrorRepository extends JpaRepository<AIError, Long> {
    List<AIError> findByEvaluationId(Long evaluationId);
    long countByEvaluationId(Long evaluationId);
}