package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictTranslation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DictTranslationRepository extends JpaRepository<DictTranslation, Long> {

    List<DictTranslation> findByWordId(Long wordId);
}