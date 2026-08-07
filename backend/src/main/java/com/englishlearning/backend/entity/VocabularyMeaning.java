package com.englishlearning.backend.entity;


import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "vocabulary_meaning")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyMeaning {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "vocabulary_id",
            nullable = false
    )
    private Vocabulary vocabulary;



    @Column(
            name="part_of_speech",
            length = 50
    )
    private String partOfSpeech;



    @Column(columnDefinition = "TEXT")
    private String meaning;



    @Column(columnDefinition = "TEXT")
    private String example;

}