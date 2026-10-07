package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dict_word_relations")
@Getter
@Setter
public class DictWordRelation {

    @Id
    private Long id;

    @Column(name = "word_id", nullable = false)
    private Long wordId;

    @Column(columnDefinition = "TEXT")
    private String relatedWord;

    @Column(name = "relation_type", length = 255)
    private String relationType;
}