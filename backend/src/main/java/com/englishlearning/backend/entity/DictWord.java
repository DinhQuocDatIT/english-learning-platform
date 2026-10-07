package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dict_words")
@Getter
@Setter
public class DictWord {

    @Id
    private Long id;

    @Column(nullable = false, length = 255)
    private String word;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "lang_code", length = 255)
    private String langCode;
}