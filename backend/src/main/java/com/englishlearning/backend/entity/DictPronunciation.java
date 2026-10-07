package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dict_pronunciations")
@Getter
@Setter
public class DictPronunciation {

    @Id
    private Long id;

    @Column(name = "word_id", nullable = false)
    private Long wordId;

    @Column(columnDefinition = "TEXT")
    private String ipa;

    @Column(length = 255)
    private String region;
}