package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dict_word_definitions")
@Getter
@Setter
public class DictWordDefinition {

    @Id
    private Long id;

    @Column(name = "word_id", nullable = false)
    private Long wordId;

    @Column(name = "definition_id", nullable = false)
    private Long definitionId;

    @Column(columnDefinition = "TEXT")
    private String example;

    @Column(name = "source_id")
    private Long sourceId;
}