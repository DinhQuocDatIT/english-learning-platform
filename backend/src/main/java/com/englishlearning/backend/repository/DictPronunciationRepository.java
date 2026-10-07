package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictPronunciation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DictPronunciationRepository extends JpaRepository<DictPronunciation, Long> {

    List<DictPronunciation> findByWordId(Long wordId);

    @Query("SELECT p FROM DictPronunciation p WHERE p.wordId IN :wordIds")
    List<DictPronunciation> findByWordIdIn(@Param("wordIds") List<Long> wordIds);
}