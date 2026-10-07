package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictPronunciation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DictPronunciationRepository extends JpaRepository<DictPronunciation, Long> {

    List<DictPronunciation> findByWordId(Long wordId);
}