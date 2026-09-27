package com.englishlearning.backend.entity;

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
@Table(name = "grammar_roadmap")
public class GrammarRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;              // "TOEIC 600"

    @Column(length = 100)
    private String subtitle;          // "NỀN TẢNG VỮNG CHẮC"

    @Column(nullable = false)
    private Integer level;            // 1, 2, 3

    @Column(name = "level_label", length = 50)
    private String levelLabel;        // "Cấp độ 1 - Cơ bản"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String color;             // "#3b82f6"

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "roadmap", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GrammarTopic> topics = new ArrayList<>();
}