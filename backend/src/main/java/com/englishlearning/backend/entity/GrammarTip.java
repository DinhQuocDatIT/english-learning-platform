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
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "grammar_tip")
public class GrammarTip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private GrammarTopic topic;

    // Tiêu đề mẹo — VD: "Mẹo '3 giây' kẹp giữa The và Danh từ"
    @Column(nullable = false, length = 255)
    private String title;

    // Đoạn giải thích mẹo
    @Column(columnDefinition = "TEXT")
    private String content;

    // Các bước áp dụng — JSON array: ["Bước 1", "Bước 2", ...]
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "apply_steps", columnDefinition = "JSON")
    private String applySteps;

    // ===== Phần "THỬ ÁP DỤNG NGAY" =====

    // Câu hỏi tiếng Anh có chỗ trống: "The ____ feedback from the client..."
    @Column(name = "question", columnDefinition = "TEXT")
    private String question;

    // 4 đáp án — JSON array: ["constructive", "construct", "construction", "constructively"]
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options", columnDefinition = "JSON")
    private String options;

    // Đáp án đúng: "A" / "B" / "C" / "D"
    @Column(name = "correct_answer", length = 1)
    private String correctAnswer;

    // Giải thích đáp án
    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

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