package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_ai_error", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "error_key"})
})
public class StudentAIError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // ============ PHÂN LOẠI ============
    @Column(nullable = false, length = 50)
    private String errorCategory;       // "TENSE"

    @Column(nullable = false, length = 100)
    private String errorSubtype;        // "PRESENT_SIMPLE"

    @Column(nullable = false, length = 150)
    private String errorKey;            // "TENSE_PRESENT_SIMPLE"

    // Giữ lại để backward compat (data cũ)
    @Column(nullable = false, length = 50)
    private String errorType;           // "TENSE"

    // ============ THỐNG KÊ ============
    @Column(nullable = false)
    private Integer occurrenceCount = 1;

    @Column(nullable = false)
    private Integer correctedCount = 0;

    @Column(nullable = false)
    private Integer masteryScore = 0;

    // ============ VÍ DỤ ============
    @Column(columnDefinition = "JSON")
    private String examples;            // ["She go to school", "He play football"]

    // ============ THỜI GIAN ============
    @Column(nullable = false)
    private LocalDateTime firstOccurredAt;

    @Column(nullable = false)
    private LocalDateTime lastOccurredAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (firstOccurredAt == null) {
            firstOccurredAt = LocalDateTime.now();
        }
        if (lastOccurredAt == null) {
            lastOccurredAt = LocalDateTime.now();
        }
        if (occurrenceCount == null) occurrenceCount = 1;
        if (correctedCount == null) correctedCount = 0;
        if (masteryScore == null) masteryScore = 0;
        if (examples == null) examples = "[]";
    }
}