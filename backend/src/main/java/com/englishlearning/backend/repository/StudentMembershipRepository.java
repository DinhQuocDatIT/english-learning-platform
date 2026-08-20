package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.StudentMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface StudentMembershipRepository
        extends JpaRepository<StudentMembership, Long> {

    boolean existsByMembershipPackageId(Long membershipPackageId);
    long countByMembershipPackageId(Long membershipPackageId);

    @Query("""
        SELECT COALESCE(SUM(sm.paidPrice), 0)
        FROM StudentMembership sm
        WHERE sm.membershipPackage.id = :packageId
    """)
    BigDecimal sumPaidPriceByMembershipPackageId(
            @Param("packageId") Long packageId
    );
}