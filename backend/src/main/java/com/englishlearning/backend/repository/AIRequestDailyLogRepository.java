package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIRequestDailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AIRequestDailyLogRepository
        extends JpaRepository<AIRequestDailyLog, Long> {

    Optional<AIRequestDailyLog> findByStudentIdAndRequestDate(
            Long studentId,
            LocalDate requestDate
    );
}