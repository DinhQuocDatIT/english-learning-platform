package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.StudentMembership;
import com.englishlearning.backend.enums.StudentMembershipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    long countByStatus(StudentMembershipStatus status);

    @Query("""
    SELECT sm FROM StudentMembership sm
    JOIN sm.student s
    JOIN s.user u
    JOIN sm.membershipPackage p
    WHERE (:status IS NULL OR sm.status = :status)
      AND (:fromDate IS NULL OR sm.createdAt >= :fromDate)
      AND (:toDate IS NULL OR sm.createdAt < :toDate)
      AND (
            :keyword IS NULL OR :keyword = ''
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR CAST(sm.id AS string) LIKE CONCAT('%', :keyword, '%')
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
      )
""")
    Page<StudentMembership> search(
            @Param("status") StudentMembershipStatus status,
            @Param("keyword") String keyword,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}