package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dict_definitions")
@Getter
@Setter
public class DictDefinition {

    @Id
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String definition;

    @Column(length = 255)
    private String pos;

    @Column(name = "sub_pos", length = 255)
    private String subPos;

    @Column(name = "definition_lang", length = 255)
    private String definitionLang;

    @Column(columnDefinition = "TEXT")
    private String links;
}