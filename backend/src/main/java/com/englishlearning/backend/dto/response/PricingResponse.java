package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingResponse {
    private Long id;
    private String provider;
    private String model;
    private BigDecimal inputPricePerMillion;
    private BigDecimal outputPricePerMillion;
    private Boolean isActive;
    private Boolean isInUse;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
    private LocalDateTime createdAt;
}