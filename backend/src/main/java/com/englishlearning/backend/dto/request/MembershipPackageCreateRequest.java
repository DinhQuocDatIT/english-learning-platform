package com.englishlearning.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MembershipPackageCreateRequest {

    @NotBlank(message = "Tên gói không được để trống")
    private String name;

    @NotNull(message = "Thời hạn không được để trống")
    @Min(value = 1, message = "Thời hạn phải lớn hơn 0")
    private Integer duration;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(
            value = "0",
            inclusive = true,
            message = "Giá không được nhỏ hơn 0"
    )
    private BigDecimal price;

    private String description;

    private Boolean isFeatured = false;
}