package com.englishlearning.backend.repository;


import com.englishlearning.backend.entity.Vocabulary;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface VocabularyRepository
        extends JpaRepository<Vocabulary,Long>{
    List<Vocabulary> findByDeletedAtIsNull();
    Optional<Vocabulary> findByIdAndDeletedAtIsNull(Long id);
    boolean existsByWordIgnoreCase(String word);

}