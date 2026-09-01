package com.englishlearning.backend.entity;

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
@Table(name = "ai_answer")
public class AIAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turn_id", nullable = false, unique = true)
    private AIPracticeTurn turn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String studentAnswer;

    private Integer score;

    @Column(nullable = false)
    private Boolean isCorrect = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime answeredAt;

    // 1:1 with AIEvaluation
    @OneToOne(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
    private AIEvaluation evaluation;
}