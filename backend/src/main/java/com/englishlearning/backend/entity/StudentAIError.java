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
@Table(
        name = "student_ai_error",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_student_weakness",
                columnNames = {"student_id", "weakness_key"}
        )
)
public class StudentAIError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    @Column(length = 50)
    private String errorCategory;

    @Column(length = 100)
    private String errorType;

    @Column(name = "weakness_key", length = 50, nullable = false)
    private String weaknessKey;

    @Column(nullable = false)
    private Integer occurrenceCount = 1;

    @Column(nullable = false)
    private Integer correctedCount = 0;

    @Column(nullable = false)
    private Integer masteryScore = 0;

    @Column(columnDefinition = "JSON")
    private String examples;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime firstOccurredAt;

    @UpdateTimestamp
    private LocalDateTime lastOccurredAt;
}