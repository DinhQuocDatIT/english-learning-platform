package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_evaluation")
public class AIEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    private AIAnswer answer;

    @Column(nullable = false, length = 20)
    private String correctness; // CORRECT, PARTIALLY_CORRECT, INCORRECT

    @Column(nullable = false)
    private Integer score; // 0-100

    private Integer naturalnessScore; // 0-100

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // 1:N with AIError
    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AIError> errors = new ArrayList<>();
}