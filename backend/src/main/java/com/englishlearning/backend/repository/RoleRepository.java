package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    public boolean existsByName(String name);
}
