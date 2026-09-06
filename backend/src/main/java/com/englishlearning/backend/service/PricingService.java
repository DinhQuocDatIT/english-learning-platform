package com.englishlearning.backend.service;

import com.englishlearning.backend.entity.AIModelPricing;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ErrorCode;
import com.englishlearning.backend.repository.AIModelPricingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PricingService {

    private final AIModelPricingRepository pricingRepository;

    /**
     * Tính chi phí - CHỈ LẤY TỪ DATABASE
     */
    public BigDecimal calculateCost(String provider, String model, int inputTokens, int outputTokens) {
        try {
            LocalDateTime now = LocalDateTime.now();
            AIModelPricing pricing = pricingRepository
                    .findEffectiveByProviderAndModel(provider, model, now)
                    .orElseThrow(() -> new BusinessException("Không tìm thấy pricing cho model: " + model));

            BigDecimal inputCost = BigDecimal.valueOf(inputTokens)
                    .divide(BigDecimal.valueOf(1_000_000), 10, RoundingMode.HALF_UP)
                    .multiply(pricing.getInputPricePerMillionTokens());

            BigDecimal outputCost = BigDecimal.valueOf(outputTokens)
                    .divide(BigDecimal.valueOf(1_000_000), 10, RoundingMode.HALF_UP)
                    .multiply(pricing.getOutputPricePerMillionTokens());

            BigDecimal totalCost = inputCost.add(outputCost);

            log.debug("Using DB pricing for {}:{} - Input: {}, Output: {}, Total: {}",
                    provider, model, inputCost, outputCost, totalCost);

            return totalCost;

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calculating cost for {}:{} - {}", provider, model, e.getMessage());
            throw new BusinessException("Không thể tính chi phí cho model: " + model);
        }
    }

    /**
     * Lấy pricing hiện tại cho model
     */
    public AIModelPricing getCurrentPricing(String provider, String model) {
        LocalDateTime now = LocalDateTime.now();
        return pricingRepository
                .findEffectiveByProviderAndModel(provider, model, now)
                .orElseThrow(() -> new BusinessException("Không tìm thấy pricing cho model: " + model));
    }
}