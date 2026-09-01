package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.ErrorType;
import com.englishlearning.backend.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_error")
public class AIError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private AIEvaluation evaluation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ErrorType errorType;

    @Column(columnDefinition = "TEXT")
    private String userText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String correctText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeverityLevel severity = SeverityLevel.MEDIUM;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}