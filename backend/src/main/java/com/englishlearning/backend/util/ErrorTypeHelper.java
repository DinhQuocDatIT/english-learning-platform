package com.englishlearning.backend.util;

import java.util.Map;

public final class ErrorTypeHelper {

    private ErrorTypeHelper() {}

    private static final Map<String, String> DISPLAY_NAMES = Map.ofEntries(
            Map.entry("GRAMMAR", "Ngữ pháp"),
            Map.entry("VOCABULARY", "Từ vựng"),
            Map.entry("ARTICLE", "Mạo từ"),
            Map.entry("PREPOSITION", "Giới từ"),
            Map.entry("TENSE", "Thì"),
            Map.entry("WORD_ORDER", "Trật tự từ"),
            Map.entry("SPELLING", "Chính tả"),
            Map.entry("WORD_CHOICE", "Lựa chọn từ"),
            Map.entry("NATURALNESS", "Độ tự nhiên"),
            Map.entry("MISSING_WORD", "Thiếu từ"),
            Map.entry("EXTRA_WORD", "Thừa từ"),
            Map.entry("PUNCTUATION", "Dấu câu"),
            Map.entry("CAPITALIZATION", "Viết hoa")
    );

    private static final Map<String, String> SUGGESTIONS = Map.ofEntries(
            Map.entry("GRAMMAR", "Ôn tập cấu trúc ngữ pháp cơ bản"),
            Map.entry("VOCABULARY", "Học thêm từ vựng theo chủ đề"),
            Map.entry("ARTICLE", "Ôn quy tắc dùng a/an/the"),
            Map.entry("PREPOSITION", "Học các cụm giới từ thông dụng"),
            Map.entry("TENSE", "Ôn thì và cách dùng"),
            Map.entry("WORD_ORDER", "Ôn trật tự từ trong câu"),
            Map.entry("SPELLING", "Luyện viết chính tả"),
            Map.entry("WORD_CHOICE", "Luyện chọn từ phù hợp ngữ cảnh"),
            Map.entry("NATURALNESS", "Đọc nhiều để cải thiện độ tự nhiên"),
            Map.entry("MISSING_WORD", "Kiểm tra câu trước khi gửi"),
            Map.entry("EXTRA_WORD", "Kiểm tra câu trước khi gửi"),
            Map.entry("PUNCTUATION", "Ôn quy tắc dùng dấu câu"),
            Map.entry("CAPITALIZATION", "Ôn quy tắc viết hoa")
    );

    public static String displayName(String errorType) {
        if (errorType == null) return "Không xác định";
        return DISPLAY_NAMES.getOrDefault(errorType, errorType);
    }

    public static String suggestion(String errorType) {
        if (errorType == null) return "Luyện tập thêm";
        return SUGGESTIONS.getOrDefault(errorType, "Luyện tập thêm");
    }
}