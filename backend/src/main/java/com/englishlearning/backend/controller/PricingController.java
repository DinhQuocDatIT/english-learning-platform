package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.CreatePricingRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.PricingResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.PricingManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/pricing")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PricingController {

    private final PricingManagementService pricingService;

    /**
     * GET /api/v1/admin/pricing
     * Lấy tất cả pricing
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PricingResponse>>> getAllPricing(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} getting all pricing", userDetails.getUsername());

        List<PricingResponse> response = pricingService.getAllPricing();
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy danh sách pricing thành công", response)
        );
    }

    /**
     * GET /api/v1/admin/pricing/active
     * Lấy pricing đang active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PricingResponse>>> getActivePricing(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} getting active pricing", userDetails.getUsername());

        List<PricingResponse> response = pricingService.getActivePricing();
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy danh sách pricing active thành công", response)
        );
    }

    /**
     * GET /api/v1/admin/pricing/{id}
     * Lấy pricing theo id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PricingResponse>> getPricingById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} getting pricing by id: {}", userDetails.getUsername(), id);

        PricingResponse response = pricingService.getPricingById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy pricing thành công", response)
        );
    }

    /**
     * POST /api/v1/admin/pricing
     * Tạo pricing mới
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PricingResponse>> createPricing(
            @Valid @RequestBody CreatePricingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} creating pricing for model: {}", userDetails.getUsername(), request.getModel());

        PricingResponse response = pricingService.createPricing(request);
        return ResponseEntity.ok(
                new ApiResponse<>(201, "Tạo pricing thành công", response)
        );
    }

    /**
     * PUT /api/v1/admin/pricing/{id}
     * Cập nhật pricing
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PricingResponse>> updatePricing(
            @PathVariable Long id,
            @Valid @RequestBody CreatePricingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} updating pricing with id: {}", userDetails.getUsername(), id);

        PricingResponse response = pricingService.updatePricing(id, request);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Cập nhật pricing thành công", response)
        );
    }

    /**
     * DELETE /api/v1/admin/pricing/{id}
     * Vô hiệu hóa pricing (soft delete - set effective_to = now)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivatePricing(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Admin {} deactivating pricing with id: {}", userDetails.getUsername(), id);

        pricingService.deactivatePricing(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Đã vô hiệu hóa pricing", null)
        );
    }
}