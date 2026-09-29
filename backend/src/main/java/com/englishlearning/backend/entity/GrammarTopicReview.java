package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.GrammarReviewAction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "grammar_topic_review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopicReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grammar_topic_id", nullable = false)
    private GrammarTopic grammarTopic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GrammarReviewAction action;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @PrePersist
    public void prePersist() {
        if (performedAt == null) performedAt = LocalDateTime.now();
    }
}