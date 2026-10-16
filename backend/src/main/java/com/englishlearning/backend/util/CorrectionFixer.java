package com.englishlearning.backend.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class tự động sửa các lỗi punctuation & capitalization phổ biến.
 * Dùng làm fallback khi AI không sửa đúng hoặc cắt bớt câu.
 */
public class CorrectionFixer {

    /**
     * Tự động sửa các lỗi punctuation & capitalization phổ biến.
     */
    public static String fixCommonErrors(String text) {
        if (text == null || text.isBlank()) return text;

        String fixed = text.trim();

        // 1. Xóa dấu cách trước dấu chấm, phẩy, hỏi, than, hai chấm
        fixed = fixed.replaceAll("\\s+([.,!?;:])", "$1");

        // 2. Thêm dấu cách sau dấu chấm/phẩy nếu thiếu (trừ khi là số thập phân)
        fixed = fixed.replaceAll("([.,!?;:])([A-Za-zÀ-ỹ])", "$1 $2");

        // 3. Viết hoa chữ cái đầu câu
        fixed = capitalizeFirstLetter(fixed);

        // 4. Viết hoa chữ cái sau dấu . ! ?
        fixed = capitalizeAfterPunctuation(fixed);

        // 5. Chuẩn hóa khoảng trắng (2+ space → 1 space)
        fixed = fixed.replaceAll("\\s+", " ").trim();

        return fixed;
    }

    private static String capitalizeFirstLetter(String text) {
        if (text == null || text.isEmpty()) return text;
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }

    private static String capitalizeAfterPunctuation(String text) {
        Pattern pattern = Pattern.compile("([.!?]\\s+)([a-zà-ỹ])");
        Matcher matcher = pattern.matcher(text);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            matcher.appendReplacement(sb,
                    matcher.group(1) + matcher.group(2).toUpperCase());
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    /**
     * So sánh 2 câu để tìm danh sách lỗi (dùng khi AI cắt bớt).
     */
    public static List<String> findDifferences(String original, String corrected) {
        List<String> diffs = new ArrayList<>();
        if (original == null || corrected == null) return diffs;

        String[] origWords = original.split("\\s+");
        String[] corrWords = corrected.split("\\s+");

        int maxLen = Math.max(origWords.length, corrWords.length);
        for (int i = 0; i < maxLen; i++) {
            String o = i < origWords.length ? origWords[i] : "";
            String c = i < corrWords.length ? corrWords[i] : "";
            if (!o.equals(c)) {
                diffs.add("'" + o + "' → '" + c + "'");
            }
        }
        return diffs;
    }
}