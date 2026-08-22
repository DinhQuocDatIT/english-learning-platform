package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.StudentMembership;
import com.englishlearning.backend.enums.StudentMembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

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

    Optional<StudentMembership>
    findFirstByStudentIdAndStatusOrderByEndDateDesc(
            Long studentId,
            StudentMembershipStatus status
    );
    @Query("""
    SELECT COALESCE(SUM(sm.paidPrice), 0)
    FROM StudentMembership sm
""")
    public BigDecimal sumTotalRevenue();
    @Query("""
    SELECT COUNT(DISTINCT sm.student.id)
    FROM StudentMembership sm
""")
    public Long countTotalUsers();
}