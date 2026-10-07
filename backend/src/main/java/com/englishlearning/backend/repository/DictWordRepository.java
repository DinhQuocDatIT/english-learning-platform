package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictWord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DictWordRepository extends JpaRepository<DictWord, Long> {

    Optional<DictWord> findFirstByWordIgnoreCaseAndLangCode(String word, String langCode);

    @Query("""
        SELECT w FROM DictWord w 
        WHERE LOWER(w.word) LIKE LOWER(CONCAT('%', :kw, '%'))
          AND w.langCode IN ('en', 'vi')
        ORDER BY 
            CASE WHEN LOWER(w.word) = LOWER(:kw) THEN 0 ELSE 1 END,
            CASE WHEN w.langCode = 'en' THEN 0 ELSE 1 END,
            LENGTH(w.word), w.word
    """)
    List<DictWord> searchByKeyword(@Param("kw") String kw, Pageable pageable);

    @Query("""
        SELECT w FROM DictWord w 
        WHERE LOWER(w.word) = LOWER(:word) 
        ORDER BY 
            CASE WHEN w.langCode = 'en' THEN 0 
                 WHEN w.langCode = 'vi' THEN 1 
                 ELSE 2 END
    """)
    List<DictWord> findAllByWordIgnoreCase(@Param("word") String word);

    @Query("""
        SELECT w FROM DictWord w 
        WHERE LOWER(w.word) = LOWER(:word) 
          AND w.langCode = :lang
        ORDER BY w.id
    """)
    List<DictWord> findByWordAndLang(@Param("word") String word, @Param("lang") String lang);

    @Query("""
        SELECT w FROM DictWord w 
        WHERE LOWER(w.word) LIKE LOWER(:word) 
        ORDER BY 
            CASE WHEN w.langCode = 'en' THEN 0 
                 WHEN w.langCode = 'vi' THEN 1 
                 ELSE 2 END
    """)
    List<DictWord> findByWordLikeIgnoreCase(@Param("word") String word);

    @Query("""
        SELECT w FROM DictWord w 
        WHERE (
            LOWER(w.word) = LOWER(:kw)
            OR LOWER(w.word) LIKE LOWER(CONCAT(:kw, '%'))
        )
          AND w.langCode IN ('en', 'vi')
        ORDER BY 
            CASE WHEN LOWER(w.word) = LOWER(:kw) THEN 0 ELSE 1 END,
            CASE WHEN w.langCode = 'en' THEN 0 ELSE 1 END,
            LENGTH(w.word), w.word
    """)
    List<DictWord> searchByKeywordExact(@Param("kw") String kw, Pageable pageable);

    // ===== ADMIN QUERIES =====

    Page<DictWord> findByLangCode(String langCode, Pageable pageable);

    @Query("""
        SELECT w FROM DictWord w 
        WHERE w.langCode = :lang
          AND LOWER(w.word) LIKE LOWER(CONCAT('%', :kw, '%'))
        ORDER BY 
            CASE WHEN LOWER(w.word) = LOWER(:kw) THEN 0 
                 WHEN LOWER(w.word) LIKE LOWER(CONCAT(:kw, '%')) THEN 1 
                 ELSE 2 END,
            LENGTH(w.word),
            w.word
    """)
    Page<DictWord> searchByLangAndKeyword(
            @Param("lang") String lang,
            @Param("kw") String kw,
            Pageable pageable
    );
}