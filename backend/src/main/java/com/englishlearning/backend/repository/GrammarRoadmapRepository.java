package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.GrammarRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarRoadmapRepository extends JpaRepository<GrammarRoadmap, Long> {


    List<GrammarRoadmap> findAllByOrderByDisplayOrderAsc();
    boolean existsByNameIgnoreCase(String name);
}