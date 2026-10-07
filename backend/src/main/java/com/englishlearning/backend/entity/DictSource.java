package com.englishlearning.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dict_sources")
@Getter
@Setter
public class DictSource {

    @Id
    private Long id;

    @Column(length = 255)
    private String name;
}