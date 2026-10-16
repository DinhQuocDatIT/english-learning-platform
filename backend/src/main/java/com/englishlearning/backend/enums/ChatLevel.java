package com.englishlearning.backend.enums;

import lombok.Getter;

@Getter
public enum ChatLevel {

    BEGINNER("Beginner", "Cơ bản"),
    INTERMEDIATE("Intermediate", "Trung cấp"),
    ADVANCED("Advanced", "Nâng cao");

    private final String displayName;
    private final String displayNameVi;

    ChatLevel(String displayName, String displayNameVi) {
        this.displayName = displayName;
        this.displayNameVi = displayNameVi;
    }
}