package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.ErrorType;
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ErrorType errorType;

    @Column(nullable = false, length = 255)
    private String errorKey; // e.g., "ARTICLE_A_AN", "PREPOSITION_AT_IN_ON"

    @Column(nullable = false)
    private Integer occurrenceCount = 1;

    @Column(nullable = false)
    private Integer correctedCount = 0;

    @Column(nullable = false)
    private Integer masteryScore = 0; // 0-100

    @Column(nullable = false)
    private LocalDateTime lastOccurredAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (lastOccurredAt == null) {
            lastOccurredAt = LocalDateTime.now();
        }
        if (occurrenceCount == null) {
            occurrenceCount = 1;
        }
        if (correctedCount == null) {
            correctedCount = 0;
        }
        if (masteryScore == null) {
            masteryScore = 0;
        }
    }
}