package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.StudentMembership;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentMembershipRepository
        extends JpaRepository<StudentMembership, Long> {

    boolean existsByMembershipPackageId(Long membershipPackageId);
}