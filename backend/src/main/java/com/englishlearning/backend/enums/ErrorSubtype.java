package com.englishlearning.backend.enums;

import lombok.Getter;

@Getter
public enum ErrorSubtype {

    // ===== TENSE =====
    PRESENT_SIMPLE("Thì hiện tại đơn", "Hành động thường xuyên, thói quen"),
    PRESENT_CONTINUOUS("Thì hiện tại tiếp diễn", "Hành động đang xảy ra"),
    PRESENT_PERFECT("Thì hiện tại hoàn thành", "Hành động đã xảy ra còn liên quan hiện tại"),
    PRESENT_PERFECT_CONTINUOUS("Thì hiện tại hoàn thành tiếp diễn", "Nhấn mạnh tính liên tục"),
    PAST_SIMPLE("Thì quá khứ đơn", "Hành động đã xảy ra và kết thúc"),
    PAST_CONTINUOUS("Thì quá khứ tiếp diễn", "Hành động đang xảy ra trong quá khứ"),
    PAST_PERFECT("Thì quá khứ hoàn thành", "Hành động xảy ra trước hành động khác"),
    PAST_PERFECT_CONTINUOUS("Thì quá khứ hoàn thành tiếp diễn", "Nhấn mạnh tính liên tục"),
    FUTURE_SIMPLE("Thì tương lai đơn", "Quyết định tức thì, dự đoán"),
    FUTURE_CONTINUOUS("Thì tương lai tiếp diễn", "Đang xảy ra tại thời điểm tương lai"),
    FUTURE_PERFECT("Thì tương lai hoàn thành", "Hoàn thành trước mốc tương lai"),
    FUTURE_PERFECT_CONTINUOUS("Thì tương lai hoàn thành tiếp diễn", "Nhấn mạnh tính liên tục"),
    NEAR_FUTURE_GOING_TO("Tương lai gần (be going to)", "Kế hoạch đã định trước"),
    MIXED_TENSE("Lẫn lộn các thì", "Sử dụng sai thì"),

    // ===== ARTICLE =====
    A_AN("Mạo từ a/an", "Mạo từ bất định"),
    THE("Mạo từ the", "Mạo từ xác định"),
    ZERO_ARTICLE("Không dùng mạo từ", "Trường hợp không cần a/an/the"),
    A_AN_VS_THE("Nhầm lẫn a/an với the", "Dùng sai mạo từ"),

    // ===== PREPOSITION =====
    TIME_IN("Giới từ thời gian: in", "in + tháng/năm/mùa/buổi"),
    TIME_ON("Giới từ thời gian: on", "on + thứ/ngày"),
    TIME_AT("Giới từ thời gian: at", "at + giờ"),
    PLACE_IN("Giới từ nơi chốn: in", "in + không gian lớn/kín"),
    PLACE_ON("Giới từ nơi chốn: on", "on + bề mặt"),
    PLACE_AT("Giới từ nơi chốn: at", "at + địa điểm cụ thể"),
    DIRECTION_TO("Giới từ hướng: to", "to + đích đến"),
    MOVEMENT_INTO("Giới từ chuyển động: into", "into = vào trong"),
    AGENT_BY("Giới từ tác nhân: by", "by + tác nhân bị động"),
    INSTRUMENT_WITH("Giới từ công cụ: with", "with + công cụ"),
    PHRASAL_VERB("Cụm động từ", "Động từ + giới từ"),
    ADJECTIVE_PREP("Tính từ + giới từ", "Tính từ đi kèm giới từ"),
    VERB_PREP("Động từ + giới từ", "Động từ đi kèm giới từ"),

    // ===== CONJUNCTION =====
    COORDINATING("Liên từ kết hợp", "and, but, or, so"),
    SUBORDINATING("Liên từ phụ thuộc", "because, although, when, if"),
    CORRELATIVE("Liên từ tương quan", "both...and, either...or"),
    CONNECTING_ADVERB("Trạng từ nối", "however, therefore"),
    WRONG_CONJUNCTION("Dùng sai liên từ", "Sai hoặc thừa liên từ"),

    // ===== STRUCTURE =====
    WORD_ORDER("Trật tự từ", "Sắp xếp từ sai thứ tự"),
    SUBJECT_VERB_AGREEMENT("Hòa hợp chủ ngữ - động từ", "Động từ không chia theo chủ ngữ"),
    MISSING_SUBJECT("Thiếu chủ ngữ", "Câu thiếu chủ ngữ"),
    MISSING_VERB("Thiếu động từ", "Câu thiếu động từ chính"),
    MISSING_OBJECT("Thiếu tân ngữ", "Câu thiếu tân ngữ"),
    DOUBLE_NEGATIVE("Phủ định kép", "Dùng 2 phủ định"),
    DOUBLE_VERB("Hai động từ trong câu", "Dùng 2 động từ chính"),
    REDUNDANCY("Lặp từ không cần thiết", "Dùng từ đồng nghĩa lặp"),
    FRAGMENT("Câu không hoàn chỉnh", "Câu thiếu mệnh đề chính"),
    RUN_ON("Câu dài không ngắt", "Nối nhiều mệnh đề"),

    // ===== POS =====
    NOUN_ADJECTIVE("Nhầm danh từ - tính từ", "Dùng sai loại từ"),
    ADJECTIVE_ADVERB("Nhầm tính từ - trạng từ", "Dùng sai loại từ"),
    VERB_NOUN("Nhầm động từ - danh từ", "Dùng sai loại từ"),
    PRONOUN("Đại từ", "Dùng sai đại từ"),
    REFLEXIVE_PRONOUN("Đại từ phản thân", "myself, yourself..."),
    POSSESSIVE("Sở hữu", "its vs it's"),
    DEMONSTRATIVE("Chỉ định từ", "this/these, that/those"),
    QUANTIFIER("Lượng từ", "much/many, few/little"),
    DETERMINER("Hạn định từ", "some/any, each/every"),

    // ===== VERB =====
    IRREGULAR_PAST("Quá khứ bất quy tắc", "Chia sai V2"),
    IRREGULAR_PAST_PARTICIPLE("Quá khứ phân từ bất quy tắc", "Chia sai V3"),
    MODAL_VERB("Động từ khiếm khuyết", "Sau modal không có to"),
    GERUND_INFINITIVE("V-ing / to-V", "Dùng sai dạng"),
    PASSIVE_VOICE("Câu bị động", "be + V3"),
    CAUSATIVE("Câu sai khiến", "make/let/have + O + V"),
    REPORTED_SPEECH("Câu tường thuật", "Lùi thì"),
    CONDITIONAL("Câu điều kiện", "Đúng loại điều kiện"),
    WISH_CLAUSE("Câu ước (wish)", "wish + QK"),

    // ===== NATURALNESS =====
    VIETLISH("Tiếng Anh kiểu Việt", "Dịch sát nghĩa"),
    LITERAL_TRANSLATION("Dịch word-by-word", "Dịch từng từ"),
    FORMALITY("Sai mức trang trọng", "Sai văn phong"),
    AWKWARD_PHRASING("Diễn đạt lủng củng", "Câu đúng ngữ pháp nhưng không tự nhiên"),

    // ===== SPELLING =====
    TYPO("Lỗi đánh máy", "Gõ sai ký tự"),
    MISSING_LETTER("Thiếu ký tự", "Thiếu chữ cái"),
    EXTRA_LETTER("Thừa ký tự", "Thừa chữ cái"),
    WRONG_LETTER("Sai ký tự", "Sai chữ cái"),
    HOMOPHONE("Nhầm từ đồng âm", "their/there, your/you're"),
    CAPITALIZATION("Lỗi viết hoa", "Không viết hoa đầu câu"),
    MISSING_PUNCTUATION("Thiếu dấu câu", "Thiếu dấu chấm/hỏi cuối"),

    // ===== WORD_CHOICE =====
    WRONG_WORD("Dùng sai từ", "Chọn từ không phù hợp"),
    SYNONYM_MISUSE("Dùng sai từ đồng nghĩa", "Sai sắc thái"),
    COLLOCATION("Sai collocation", "Kết hợp từ không đúng"),
    REGISTER("Sai văn phong", "Quá formal/informal"),

    // ===== MEANING =====
    MISTRANSLATION("Dịch sai nghĩa", "Không đúng nghĩa câu gốc"),
    WRONG_MEANING("Sai nghĩa", "Nghĩa khác câu gốc"),
    OMISSION("Dịch thiếu ý", "Bỏ sót thông tin"),
    ADDITION("Dịch thêm ý", "Thêm thông tin không có");

    private final String displayName;
    private final String description;

    ErrorSubtype(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public ErrorCategory getCategory() {
        switch (this) {
            case PRESENT_SIMPLE, PRESENT_CONTINUOUS, PRESENT_PERFECT,
                 PRESENT_PERFECT_CONTINUOUS, PAST_SIMPLE, PAST_CONTINUOUS,
                 PAST_PERFECT, PAST_PERFECT_CONTINUOUS, FUTURE_SIMPLE,
                 FUTURE_CONTINUOUS, FUTURE_PERFECT, FUTURE_PERFECT_CONTINUOUS,
                 NEAR_FUTURE_GOING_TO, MIXED_TENSE:
                return ErrorCategory.TENSE;

            case A_AN, THE, ZERO_ARTICLE, A_AN_VS_THE:
                return ErrorCategory.ARTICLE;

            case TIME_IN, TIME_ON, TIME_AT, PLACE_IN, PLACE_ON, PLACE_AT,
                 DIRECTION_TO, MOVEMENT_INTO, AGENT_BY, INSTRUMENT_WITH,
                 PHRASAL_VERB, ADJECTIVE_PREP, VERB_PREP:
                return ErrorCategory.PREPOSITION;

            case COORDINATING, SUBORDINATING, CORRELATIVE,
                 CONNECTING_ADVERB, WRONG_CONJUNCTION:
                return ErrorCategory.CONJUNCTION;

            case WORD_ORDER, SUBJECT_VERB_AGREEMENT, MISSING_SUBJECT,
                 MISSING_VERB, MISSING_OBJECT, DOUBLE_NEGATIVE, DOUBLE_VERB,
                 REDUNDANCY, FRAGMENT, RUN_ON:
                return ErrorCategory.STRUCTURE;

            case NOUN_ADJECTIVE, ADJECTIVE_ADVERB, VERB_NOUN, PRONOUN,
                 REFLEXIVE_PRONOUN, POSSESSIVE, DEMONSTRATIVE, QUANTIFIER,
                 DETERMINER:
                return ErrorCategory.POS;

            case IRREGULAR_PAST, IRREGULAR_PAST_PARTICIPLE, MODAL_VERB,
                 GERUND_INFINITIVE, PASSIVE_VOICE, CAUSATIVE,
                 REPORTED_SPEECH, CONDITIONAL, WISH_CLAUSE:
                return ErrorCategory.VERB;

            case VIETLISH, LITERAL_TRANSLATION, FORMALITY, AWKWARD_PHRASING:
                return ErrorCategory.NATURALNESS;

            case TYPO, MISSING_LETTER, EXTRA_LETTER, WRONG_LETTER, HOMOPHONE,
                 CAPITALIZATION, MISSING_PUNCTUATION:
                return ErrorCategory.SPELLING;

            case WRONG_WORD, SYNONYM_MISUSE, COLLOCATION, REGISTER:
                return ErrorCategory.WORD_CHOICE;

            case MISTRANSLATION, WRONG_MEANING, OMISSION, ADDITION:
                return ErrorCategory.MEANING;

            default:
                return ErrorCategory.TENSE;
        }
    }

    public static String buildErrorKey(ErrorCategory category, ErrorSubtype subtype) {
        return category.name() + "_" + subtype.name();
    }

    public static String buildErrorKey(String category, String subtype) {
        return category.toUpperCase() + "_" + subtype.toUpperCase();
    }

    public static ErrorSubtype fromString(String raw) {
        if (raw == null || raw.isBlank()) {
            return MIXED_TENSE;
        }
        try {
            return ErrorSubtype.valueOf(raw.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return MIXED_TENSE;
        }
    }
}