package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dict_translations")
@Getter
@Setter
public class DictTranslation {

    @Id
    private Long id;

    @Column(name = "word_id", nullable = false)
    private Long wordId;

    @Column(name = "lang_code", length = 255)
    private String langCode;

    @Column(columnDefinition = "TEXT")
    private String translation;
}