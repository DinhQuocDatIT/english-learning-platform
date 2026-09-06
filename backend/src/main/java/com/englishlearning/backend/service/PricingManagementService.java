package com.englishlearning.backend.service;
import com.englishlearning.backend.dto.request.CreatePricingRequest;
import com.englishlearning.backend.dto.response.PricingResponse;

import java.util.List;

public interface PricingManagementService {

    /**
     * Lấy tất cả pricing
     */
    List<PricingResponse> getAllPricing();

    /**
     * Lấy pricing đang active
     */
    List<PricingResponse> getActivePricing();

    /**
     * Lấy pricing theo id
     */
    PricingResponse getPricingById(Long id);

    /**
     * Tạo pricing mới
     */
    PricingResponse createPricing(CreatePricingRequest request);

    /**
     * Cập nhật pricing
     */
    PricingResponse updatePricing(Long id, CreatePricingRequest request);

    /**
     * Vô hiệu hóa pricing (soft delete)
     */
    void deactivatePricing(Long id);
}