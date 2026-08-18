package com.englishlearning.backend.dto.response;

import com.englishlearning.backend.enums.MembershipPackageStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class MembershipPackageResponse {

    private Long id;

    private String name;

    private Integer duration;

    private BigDecimal price;

    private String description;

    private MembershipPackageStatus status;

    private Boolean isFeatured;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}