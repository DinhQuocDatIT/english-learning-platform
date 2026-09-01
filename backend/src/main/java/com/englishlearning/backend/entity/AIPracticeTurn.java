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
@Table(name = "ai_practice_turn")
public class AIPracticeTurn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practice_chat_id", nullable = false)
    private AIPracticeChat practiceChat;

    @Column(nullable = false)
    private Integer questionOrder;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String vietnameseSentence;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String expectedAnswer;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // 1:1 with AIAnswer
    @OneToOne(mappedBy = "turn", cascade = CascadeType.ALL, orphanRemoval = true)
    private AIAnswer answer;
}