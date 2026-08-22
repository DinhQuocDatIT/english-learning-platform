package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.MembershipPackage;
import com.englishlearning.backend.enums.MembershipPackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface MembershipPackageRepository
        extends JpaRepository<MembershipPackage, Long> {

    List<MembershipPackage> findAllByOrderByCreatedAtDesc();

    List<MembershipPackage> findByStatusOrderByCreatedAtDesc(
            MembershipPackageStatus status
    );

    Optional<MembershipPackage> findByIdAndStatus(
            Long id,
            MembershipPackageStatus status
    );

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(
            String name,
            Long id
    );
//    @Modifying
//    @Query("""
//            UPDATE MembershipPackage m
//            SET m.isFeatured = false
//            WHERE m.id <> :id
//            """)
//    void clearFeaturedExcept(@Param("id") Long id);
    @Modifying
    @Query("""
    UPDATE MembershipPackage m
    SET m.isFeatured = false
    WHERE m.isFeatured = true
      AND (:exceptId IS NULL OR m.id <> :exceptId)
""")
    void clearFeaturedExcept(@Param("exceptId") Long exceptId);
   public long count();

}
