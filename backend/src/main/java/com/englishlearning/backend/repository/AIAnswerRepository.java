package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIAnswerRepository extends JpaRepository<AIAnswer, Long> {
    Optional<AIAnswer> findByTurnId(Long turnId);
    boolean existsByTurnId(Long turnId);
}