package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "grammar_quiz_question")
public class GrammarQuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private GrammarQuiz quiz;

    // Câu hỏi — VD: "The marketing director gave a brief ______ ..."
    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    // 4 đáp án — JSON array: ["present", "presentation", "presently", "presenting"]
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON", nullable = false)
    private String options;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "option_explanations", columnDefinition = "JSON")
    private String optionExplanations;
    // Đáp án đúng: "A" / "B" / "C" / "D"
    @Column(name = "correct_answer", nullable = false, length = 1)
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}