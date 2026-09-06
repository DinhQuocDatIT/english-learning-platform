package com.englishlearning.backend.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class CreatePricingRequest {

    @NotBlank(message = "Provider is required")
    private String provider;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Input price is required")
    @Positive(message = "Input price must be positive")
    private BigDecimal inputPricePerMillion;

    @NotNull(message = "Output price is required")
    @Positive(message = "Output price must be positive")
    private BigDecimal outputPricePerMillion;

    private LocalDateTime effectiveFrom;
}