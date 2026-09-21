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
            "Cách diễn đạt thiếu tự nhiên so với người bản xứ"),

    SPELLING("Chính tả",
            "Lỗi viết sai chính tả, viết hoa, dấu câu"),

    WORD_CHOICE("Chọn từ",
            "Chọn từ không phù hợp ngữ cảnh, sai collocation"),

    MEANING("Ngữ nghĩa",
            "Dịch sai nghĩa, thiếu ý hoặc thêm ý so với câu gốc"),

    PUNCTUATION("Dấu câu",
            "Thiếu hoặc sai dấu chấm, phẩy, hỏi, cảm thán");

    private final String displayName;
    private final String description;

    ErrorCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}