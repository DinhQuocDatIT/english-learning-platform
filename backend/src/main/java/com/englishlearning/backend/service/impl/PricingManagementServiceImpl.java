package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.config.GeminiConfig;
import com.englishlearning.backend.dto.request.CreatePricingRequest;
import com.englishlearning.backend.dto.response.PricingResponse;
import com.englishlearning.backend.entity.AIModelPricing;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ErrorCode;
import com.englishlearning.backend.repository.AIModelPricingRepository;
import com.englishlearning.backend.service.PricingManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PricingManagementServiceImpl implements PricingManagementService {

    private final AIModelPricingRepository pricingRepository;
    private final GeminiConfig geminiConfig;

    @Override
    public List<PricingResponse> getAllPricing() {
        log.info("Getting all pricing");
        List<AIModelPricing> pricings = pricingRepository.findAllByOrderByProviderAscModelAsc();
        return pricings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PricingResponse> getActivePricing() {
        log.info("Getting active pricing");
        LocalDateTime now = LocalDateTime.now();
        List<AIModelPricing> pricings = pricingRepository.findActivePricing(now);
        return pricings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PricingResponse getPricingById(Long id) {
        log.info("Getting pricing by id: {}", id);
        AIModelPricing pricing = pricingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRICING_NOT_FOUND));
        return convertToResponse(pricing);
    }

    @Override
    public PricingResponse createPricing(CreatePricingRequest request) {
        log.info("Creating new pricing for model: {}", request.getModel());

        LocalDateTime now = LocalDateTime.now();

        // ✅ KIỂM TRA: Model đã có pricing active chưa?
        AIModelPricing existingActive = pricingRepository
                .findActiveByProviderAndModel(request.getProvider(), request.getModel())
                .orElse(null);

        if (existingActive != null) {
            // ❌ Nếu đã có active → BÁO LỖI, không tự động vô hiệu hóa
            throw new BusinessException(
                    "❌ Model '" + request.getModel() + "' đang active!\n" +
                            "Vui lòng vô hiệu hóa pricing cũ trước khi thêm mới."
            );
        }

        // ✅ Nếu chưa có active → Tạo mới
        AIModelPricing pricing = new AIModelPricing();
        pricing.setProvider(request.getProvider());
        pricing.setModel(request.getModel());
        pricing.setInputPricePerMillionTokens(request.getInputPricePerMillion());
        pricing.setOutputPricePerMillionTokens(request.getOutputPricePerMillion());
        pricing.setEffectiveFrom(now);
        pricing.setEffectiveTo(null);

        AIModelPricing saved = pricingRepository.save(pricing);
        log.info("Created new pricing with id: {}", saved.getId());

        return convertToResponse(saved);
    }

    @Override
    public PricingResponse updatePricing(Long id, CreatePricingRequest request) {
        log.info("Updating pricing with id: {}", id);

        AIModelPricing pricing = pricingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRICING_NOT_FOUND));

        // ✅ Không cho sửa giá (chỉ cho vô hiệu hóa + thêm mới)
        throw new BusinessException("❌ Không thể sửa giá. Vui lòng vô hiệu hóa và thêm mới.");
    }

    @Override
    public void deactivatePricing(Long id) {
        log.info("Deactivating pricing with id: {}", id);

        AIModelPricing pricing = pricingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRICING_NOT_FOUND));

        // ✅ Vẫn cho vô hiệu hóa dù đang dùng, nhưng log warning
        String currentModel = geminiConfig.getModel();
        boolean isInUse = pricing.getModel().equals(currentModel) && pricing.getEffectiveTo() == null;

        if (isInUse) {
            log.warn("⚠️ WARNING: Model '{}' is currently in use! Deactivating it will affect students.", currentModel);
        }

        pricing.setEffectiveTo(LocalDateTime.now());
        pricingRepository.save(pricing);

        log.info("Deactivated pricing with id: {}", id);
    }

    // ===== PRIVATE METHODS =====

    private PricingResponse convertToResponse(AIModelPricing pricing) {
        LocalDateTime now = LocalDateTime.now();
        boolean isActive = pricing.getEffectiveTo() == null ||
                pricing.getEffectiveTo().isAfter(now);

        String currentModel = geminiConfig.getModel();
        boolean isInUse = isActive && pricing.getModel().equals(currentModel);

        return PricingResponse.builder()
                .id(pricing.getId())
                .provider(pricing.getProvider())
                .model(pricing.getModel())
                .inputPricePerMillion(pricing.getInputPricePerMillionTokens())
                .outputPricePerMillion(pricing.getOutputPricePerMillionTokens())
                .isActive(isActive)
                .isInUse(isInUse)
                .effectiveFrom(pricing.getEffectiveFrom())
                .effectiveTo(pricing.getEffectiveTo())
                .createdAt(pricing.getCreatedAt())
                .build();
    }
}