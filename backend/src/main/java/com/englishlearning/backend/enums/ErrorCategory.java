package com.englishlearning.backend.enums;

import lombok.Getter;

@Getter
public enum ErrorCategory {

    TENSE("Thì",
            "Các thì trong tiếng Anh"),

    ARTICLE("Mạo từ",
            "Mạo từ a, an, the và trường hợp không dùng mạo từ"),

    PREPOSITION("Giới từ",
            "Giới từ chỉ thời gian, nơi chốn, hướng, công cụ..."),

    CONJUNCTION("Liên từ",
            "Liên từ kết hợp, phụ thuộc và trạng từ nối"),

    STRUCTURE("Cấu trúc câu",
            "Trật tự từ, thành phần câu và các lỗi cấu trúc"),

    POS("Từ loại",
            "Nhầm lẫn giữa các từ loại trong tiếng Anh"),

    VERB("Động từ",
            "Các dạng động từ, bị động, tường thuật, điều kiện..."),

    NATURALNESS("Độ tự nhiên",
            "Cách diễn đạt thiếu tự nhiên so với người bản xứ");

    private final String displayName;
    private final String description;

    ErrorCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}