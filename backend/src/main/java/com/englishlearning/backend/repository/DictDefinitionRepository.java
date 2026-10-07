package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DictDefinitionRepository extends JpaRepository<DictDefinition, Long> {
}