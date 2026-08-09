package com.englishlearning.backend.repository;


import com.englishlearning.backend.entity.Vocabulary;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface VocabularyRepository
        extends JpaRepository<Vocabulary,Long>{

    Page<Vocabulary> findByDeletedAtIsNull(
            Pageable pageable
    );
    Optional<Vocabulary> findByIdAndDeletedAtIsNull(Long id);
    boolean existsByWordIgnoreCase(String word);

    Optional<Vocabulary> findByWordIgnoreCase(String word);
}