package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.GrammarQuizAttemptStatus;
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
@Table(name = "grammar_quiz_attempt")
public class GrammarQuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private GrammarQuiz quiz;

    // Đáp án đã chọn — JSON map: {"12": "A", "13": "C", "15": "B"}
    // Key = questionId, Value = "A"/"B"/"C"/"D"
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private String answers;

    // Số câu đúng — null khi IN_PROGRESS
    @Column(name = "correct_count")
    private Integer correctCount;

    // Tổng số câu hỏi lúc nộp — null khi IN_PROGRESS
    @Column(name = "total_questions")
    private Integer totalQuestions;

    // Điểm phần trăm 0-100 — null khi IN_PROGRESS
    @Column(name = "score")
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GrammarQuizAttemptStatus status = GrammarQuizAttemptStatus.IN_PROGRESS;

    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}