package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.AIFeature;
import com.englishlearning.backend.enums.RequestType;
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
@Table(
        name = "ai_usage",
        indexes = {
                @Index(name = "idx_ai_usage_feature_ref", columnList = "feature,reference_id"),
                @Index(name = "idx_ai_usage_student_created", columnList = "student_id,created_at"),
                @Index(name = "idx_ai_usage_request_type", columnList = "request_type")
        }
)
public class AIUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AIFeature feature;

    @Column(name = "reference_id")
    private Long referenceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RequestType requestType;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false)
    private Integer inputTokens = 0;

    @Column(nullable = false)
    private Integer outputTokens = 0;

    @Column(nullable = false)
    private Integer totalTokens = 0;

    @Column(nullable = false, precision = 10, scale = 6)
    private BigDecimal estimatedCost = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer responseTimeMs = 0;

    @Column(nullable = false)
    private Boolean success = true;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private Double inputPricePerMillion;
    private Double outputPricePerMillion;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}