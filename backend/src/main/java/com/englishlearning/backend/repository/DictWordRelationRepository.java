package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictWordRelation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DictWordRelationRepository extends JpaRepository<DictWordRelation, Long> {
}