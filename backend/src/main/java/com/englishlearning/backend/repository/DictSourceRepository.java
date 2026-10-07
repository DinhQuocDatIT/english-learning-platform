package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.DictSource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DictSourceRepository extends JpaRepository<DictSource, Long> {
}