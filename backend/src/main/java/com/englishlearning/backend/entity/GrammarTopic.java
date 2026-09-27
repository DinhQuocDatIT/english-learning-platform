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
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "grammar_topic")
public class GrammarTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private GrammarRoadmap roadmap;

    // self-reference: cây cha/con (VD: "Ngữ pháp mất gốc" > "Từ loại")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private GrammarTopic parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<GrammarTopic> children = new ArrayList<>();

    @Column(nullable = false, length = 200)
    private String name;              // "Từ loại trong TOEIC (Parts of Speech)"

    @Column(nullable = false, unique = true, length = 200)
    private String slug;              // "tu-loai-trong-toeic"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions = 0;

    @Column(length = 255)
    private String icon;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GrammarStatus status = GrammarStatus.DRAFT;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GrammarTheory> theories = new ArrayList<>();
}