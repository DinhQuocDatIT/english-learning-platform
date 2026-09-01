package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.PracticeStatus;
import com.englishlearning.backend.enums.SentenceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_practice_chat")
public class AIPracticeChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;


    @Column(nullable = false, length = 10)
    private String level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SentenceType sentenceType = SentenceType.RANDOM;

    @Column(nullable = false, length = 50)
    private String topic;

    @Column(nullable = false)
    private Integer questionLimit = 20;

    @Column(nullable = false)
    private Integer questionCount = 0;

    @Column(nullable = false)
    private Integer correctCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PracticeStatus status = PracticeStatus.IN_PROGRESS;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> vocabularyWords = new ArrayList<>();


    @OneToMany(mappedBy = "practiceChat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AIPracticeTurn> turns = new ArrayList<>();

    @OneToMany(mappedBy = "practiceChat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AIUsage> usages = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
        if (questionLimit == null) {
            questionLimit = 20;
        }
        if (status == null) {
            status = PracticeStatus.IN_PROGRESS;
        }
        if (sentenceType == null) {
            sentenceType = SentenceType.RANDOM;
        }
    }
}