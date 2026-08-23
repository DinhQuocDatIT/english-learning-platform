package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LevelRepository extends JpaRepository<Level, Long> {

    boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);

    boolean existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(
            String name,
            Long id
    );

    List<Level> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<Level> findByIdAndDeletedAtIsNull(Long id);

    Optional<Level> findByIdAndDeletedAtIsNotNull(Long id);
}