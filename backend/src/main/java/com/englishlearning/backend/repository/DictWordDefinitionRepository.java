package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictWordDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DictWordDefinitionRepository extends JpaRepository<DictWordDefinition, Long> {

    List<DictWordDefinition> findByWordId(Long wordId);
}