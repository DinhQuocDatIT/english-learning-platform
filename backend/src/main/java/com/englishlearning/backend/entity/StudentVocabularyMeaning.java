package com.englishlearning.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "student_vocabulary_meaning")
@Getter
@Setter
@NoArgsConstructor
public class StudentVocabularyMeaning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_vocabulary_id", nullable = false)
    @JsonIgnore
    private StudentVocabulary studentVocabulary;

    @Column(name = "part_of_speech", length = 50)
    private String partOfSpeech;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String example;
}