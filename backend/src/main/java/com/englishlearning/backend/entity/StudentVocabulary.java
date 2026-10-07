package com.englishlearning.backend.entity;

import com.englishlearning.backend.enums.LearningStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "student_vocabulary",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_id", "word"})
        }
)
@Getter
@Setter
@NoArgsConstructor
public class StudentVocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @Column(nullable = false, length = 255)
    private String word;

    @Column(length = 255)
    private String pronunciation;

    @OneToMany(
            mappedBy = "studentVocabulary",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<StudentVocabularyMeaning> meanings = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "saved_at", nullable = false, updatable = false)
    private LocalDateTime savedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "learning_status", nullable = false)
    private LearningStatus learningStatus = LearningStatus.NOT_LEARNED;
}