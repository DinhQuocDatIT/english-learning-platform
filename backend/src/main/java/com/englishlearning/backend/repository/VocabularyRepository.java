package com.englishlearning.backend.repository;


import com.englishlearning.backend.entity.Vocabulary;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface VocabularyRepository
        extends JpaRepository<Vocabulary,Long>{

    Page<Vocabulary> findByDeletedAtIsNull(
            Pageable pageable
    );
    Optional<Vocabulary> findByIdAndDeletedAtIsNull(Long id);
    boolean existsByWordIgnoreCase(String word);
    @Query("""
    SELECT v
    FROM Vocabulary v
    WHERE
        (
            :keyword = ''
            OR LOWER(v.word) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR CAST(v.id AS string) LIKE CONCAT('%', :keyword, '%')
        )
        AND (
            :status = 'ALL'
            OR (:status = 'ACTIVE' AND v.deletedAt IS NULL)
            OR (:status = 'INACTIVE' AND v.deletedAt IS NOT NULL)
        )
""")
    Page<Vocabulary> searchVocabulary(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable
    );
    Optional<Vocabulary> findByWordIgnoreCase(String word);
}