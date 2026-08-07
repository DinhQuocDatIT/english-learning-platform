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
@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer experience = 0;

    private Integer totalLearningSeconds = 0;

    private Integer totalCompletedTopic = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;

    @OneToMany(
            mappedBy="student",
            cascade=CascadeType.ALL,
            orphanRemoval=true
    )
    private List<StudentVocabulary> savedVocabularies = new ArrayList<>();
}