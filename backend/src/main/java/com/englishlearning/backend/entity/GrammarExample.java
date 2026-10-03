package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.GrammarStatus;
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
@Table(name = "grammar_example")
public class GrammarExample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private GrammarTopic topic;

    // Câu tiếng Anh
    @Column(name = "sentence_en", nullable = false, columnDefinition = "TEXT")
    private String sentenceEn;

    // Dịch tiếng Việt
    @Column(name = "sentence_vi", columnDefinition = "TEXT")
    private String sentenceVi;

    // Giải thích ngữ pháp
    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GrammarStatus status = GrammarStatus.DRAFT;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}