package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_model_pricing")
public class AIModelPricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false, precision = 10, scale = 6)
    private BigDecimal inputPricePerMillionTokens;

    @Column(nullable = false, precision = 10, scale = 6)
    private BigDecimal outputPricePerMillionTokens;

    @Column(nullable = false)
    private LocalDateTime effectiveFrom;

    private LocalDateTime effectiveTo;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}