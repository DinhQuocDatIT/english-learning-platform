package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictWordDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DictWordDefinitionRepository extends JpaRepository<DictWordDefinition, Long> {

    List<DictWordDefinition> findByWordId(Long wordId);

    @Query("""
        SELECT wd.wordId, COUNT(wd)
        FROM DictWordDefinition wd
        JOIN DictDefinition d ON d.id = wd.definitionId
        WHERE wd.wordId IN :wordIds
          AND d.definitionLang = 'vi'
          AND d.pos IN ('N', 'NOUN', 'V', 'VERB', 'A', 'ADJ', 'ADJECTIVE',
                        'ADV', 'ADVERB', 'PRE', 'PREPOSITION',
                        'CONJ', 'CONJUNCTION', 'PRON', 'PRONOUN',
                        'NUM', 'NUMERAL', 'ART', 'ARTICLE',
                        'INT', 'INTERJECTION')
        GROUP BY wd.wordId
    """)
    List<Object[]> countByWordIdIn(@Param("wordIds") List<Long> wordIds);
}