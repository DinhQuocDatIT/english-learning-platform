package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.GrammarStatus;
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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "grammar_theory")
public class GrammarTheory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private GrammarTopic topic;

    @Column(nullable = false, length = 255)
    private String title;             // "Định nghĩa", "Công thức", "Cách dùng", "Lưu ý"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GrammarStatus status = GrammarStatus.DRAFT;

    @Column(name = "section_type", nullable = false, length = 20)
    private String sectionType;       // TEXT / TABLE / LIST / NOTE

    @Column(columnDefinition = "TEXT")
    private String content;           // dùng khi type = TEXT / NOTE

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private String metadata;          // dùng khi type = TABLE / LIST (chuỗi JSON)

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}