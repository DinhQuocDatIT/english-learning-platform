package com.englishlearning.backend.repository;

import com.englishlearning.backend.entity.AIModelPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AIModelPricingRepository extends JpaRepository<AIModelPricing, Long> {

    // ===== TÌM KIẾM =====

    Optional<AIModelPricing> findByProviderAndModel(String provider, String model);

    /**
     * Tìm pricing đang active (effective_to = NULL)
     */
    @Query("SELECT p FROM AIModelPricing p WHERE p.provider = :provider AND p.model = :model AND p.effectiveTo IS NULL")
    Optional<AIModelPricing> findActiveByProviderAndModel(@Param("provider") String provider,
                                                          @Param("model") String model);

    /**
     * Tìm pricing có hiệu lực tại thời điểm hiện tại
     */
    @Query("SELECT p FROM AIModelPricing p WHERE p.provider = :provider AND p.model = :model " +
            "AND p.effectiveFrom <= :now AND (p.effectiveTo IS NULL OR p.effectiveTo >= :now)")
    Optional<AIModelPricing> findEffectiveByProviderAndModel(@Param("provider") String provider,
                                                             @Param("model") String model,
                                                             @Param("now") LocalDateTime now);

    // ===== LẤY DANH SÁCH =====

    List<AIModelPricing> findAllByOrderByProviderAscModelAsc();

    @Query("SELECT p FROM AIModelPricing p WHERE p.effectiveTo IS NULL OR p.effectiveTo >= :now")
    List<AIModelPricing> findActivePricing(@Param("now") LocalDateTime now);

    // ===== KIỂM TRA TỒN TẠI =====

    boolean existsByProviderAndModel(String provider, String model);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
            "FROM AIModelPricing p WHERE p.provider = :provider AND p.model = :model AND p.effectiveTo IS NULL")
    boolean existsActiveByProviderAndModel(@Param("provider") String provider,
                                           @Param("model") String model);
}