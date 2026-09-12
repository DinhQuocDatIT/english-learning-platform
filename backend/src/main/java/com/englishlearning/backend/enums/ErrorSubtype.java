package com.englishlearning.backend.enums;

import lombok.Getter;

@Getter
public enum ErrorSubtype {

    // ===== TENSE (14) =====
    PRESENT_SIMPLE("Thì hiện tại đơn",
            "Diễn tả hành động thường xuyên, thói quen, sự thật hiển nhiên"),

    PRESENT_CONTINUOUS("Thì hiện tại tiếp diễn",
            "Diễn tả hành động đang xảy ra ngay lúc nói hoặc xung quanh thời điểm nói"),

    PRESENT_PERFECT("Thì hiện tại hoàn thành",
            "Diễn tả hành động đã xảy ra trong quá khứ nhưng còn liên quan đến hiện tại"),

    PRESENT_PERFECT_CONTINUOUS("Thì hiện tại hoàn thành tiếp diễn",
            "Nhấn mạnh tính liên tục của hành động kéo dài đến hiện tại"),

    PAST_SIMPLE("Thì quá khứ đơn",
            "Diễn tả hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ"),

    PAST_CONTINUOUS("Thì quá khứ tiếp diễn",
            "Diễn tả hành động đang xảy ra tại một thời điểm trong quá khứ"),

    PAST_PERFECT("Thì quá khứ hoàn thành",
            "Diễn tả hành động xảy ra trước một hành động khác trong quá khứ"),

    PAST_PERFECT_CONTINUOUS("Thì quá khứ hoàn thành tiếp diễn",
            "Nhấn mạnh tính liên tục của hành động trước một mốc quá khứ"),

    FUTURE_SIMPLE("Thì tương lai đơn",
            "Diễn tả quyết định tức thì, dự đoán hoặc sự thật tương lai"),

    FUTURE_CONTINUOUS("Thì tương lai tiếp diễn",
            "Diễn tả hành động đang xảy ra tại một thời điểm trong tương lai"),

    FUTURE_PERFECT("Thì tương lai hoàn thành",
            "Diễn tả hành động hoàn thành trước một thời điểm trong tương lai"),

    FUTURE_PERFECT_CONTINUOUS("Thì tương lai hoàn thành tiếp diễn",
            "Nhấn mạnh tính liên tục của hành động trước một mốc tương lai"),

    NEAR_FUTURE_GOING_TO("Tương lai gần (be going to)",
            "Diễn tả kế hoạch đã định trước hoặc dự đoán có căn cứ"),

    MIXED_TENSE("Lẫn lộn các thì",
            "Sử dụng sai thì hoặc trộn nhiều thì không đúng ngữ cảnh"),

    // ===== ARTICLE (4) =====
    A_AN("Mạo từ a/an",
            "Mạo từ bất định dùng trước danh từ đếm được số ít, lần đầu được nhắc đến"),

    THE("Mạo từ the",
            "Mạo từ xác định dùng khi vật đã được xác định hoặc duy nhất"),

    ZERO_ARTICLE("Không dùng mạo từ",
            "Trường hợp không cần dùng a/an/the trước danh từ"),

    A_AN_VS_THE("Nhầm lẫn a/an với the",
            "Dùng sai giữa mạo từ bất định và xác định"),

    // ===== PREPOSITION (13) =====
    TIME_IN("Giới từ thời gian: in",
            "Dùng trước tháng, năm, mùa, buổi trong ngày"),

    TIME_ON("Giới từ thời gian: on",
            "Dùng trước thứ trong tuần và ngày cụ thể"),

    TIME_AT("Giới từ thời gian: at",
            "Dùng trước giờ cụ thể và một số cụm thời gian cố định"),

    PLACE_IN("Giới từ nơi chốn: in",
            "Dùng trước không gian lớn, kín, hoặc phạm vi địa lý"),

    PLACE_ON("Giới từ nơi chốn: on",
            "Dùng trước bề mặt tiếp xúc"),

    PLACE_AT("Giới từ nơi chốn: at",
            "Dùng trước địa điểm cụ thể, chính xác"),

    DIRECTION_TO("Giới từ hướng: to",
            "Dùng để chỉ đích đến của hành động di chuyển"),

    MOVEMENT_INTO("Giới từ chuyển động: into",
            "Dùng để chỉ sự di chuyển vào bên trong"),

    AGENT_BY("Giới từ tác nhân: by",
            "Dùng để chỉ tác nhân trong câu bị động"),

    INSTRUMENT_WITH("Giới từ công cụ: with",
            "Dùng để chỉ công cụ, phương tiện được sử dụng"),

    PHRASAL_VERB("Cụm động từ (phrasal verb)",
            "Động từ kết hợp với giới từ/trạng từ tạo nghĩa mới"),

    ADJECTIVE_PREP("Tính từ + giới từ",
            "Tính từ đi kèm giới từ cố định theo quy tắc"),

    VERB_PREP("Động từ + giới từ",
            "Động từ đi kèm giới từ cố định theo quy tắc"),

    // ===== CONJUNCTION (5) =====
    COORDINATING("Liên từ kết hợp",
            "Liên từ nối hai mệnh đề hoặc từ ngang hàng về mặt ngữ pháp"),

    SUBORDINATING("Liên từ phụ thuộc",
            "Liên từ nối mệnh đề phụ với mệnh đề chính"),

    CORRELATIVE("Liên từ tương quan",
            "Cặp liên từ đi đôi với nhau để nối hai thành phần"),

    CONNECTING_ADVERB("Trạng từ nối",
            "Trạng từ dùng để liên kết ý giữa hai câu"),

    WRONG_CONJUNCTION("Dùng sai liên từ",
            "Sử dụng liên từ không phù hợp ngữ cảnh hoặc thừa liên từ"),

    // ===== STRUCTURE (10) =====
    WORD_ORDER("Trật tự từ",
            "Sắp xếp các thành phần trong câu sai vị trí chuẩn"),

    SUBJECT_VERB_AGREEMENT("Hòa hợp chủ ngữ - động từ",
            "Động từ không chia phù hợp với chủ ngữ về số và ngôi"),

    MISSING_SUBJECT("Thiếu chủ ngữ",
            "Câu thiếu thành phần chủ ngữ bắt buộc"),

    MISSING_VERB("Thiếu động từ",
            "Câu thiếu động từ chính"),

    MISSING_OBJECT("Thiếu tân ngữ",
            "Câu thiếu tân ngữ mà động từ yêu cầu"),

    DOUBLE_NEGATIVE("Phủ định kép",
            "Dùng hai hình thức phủ định trong cùng một câu"),

    DOUBLE_VERB("Hai động từ trong một câu",
            "Sử dụng hai động từ chính không đúng cấu trúc"),

    REDUNDANCY("Lặp từ không cần thiết",
            "Dùng các từ đồng nghĩa lặp lại gây dư thừa"),

    FRAGMENT("Câu không hoàn chỉnh",
            "Câu thiếu mệnh đề chính hoặc không diễn đạt ý trọn vẹn"),

    RUN_ON("Câu dài không ngắt",
            "Nối nhiều mệnh đề mà không có dấu câu hoặc liên từ phù hợp"),

    // ===== POS (9) =====
    NOUN_ADJECTIVE("Nhầm danh từ - tính từ",
            "Dùng danh từ thay vì tính từ hoặc ngược lại"),

    ADJECTIVE_ADVERB("Nhầm tính từ - trạng từ",
            "Dùng tính từ thay vì trạng từ hoặc ngược lại"),

    VERB_NOUN("Nhầm động từ - danh từ",
            "Dùng động từ thay vì danh từ hoặc ngược lại"),

    PRONOUN("Đại từ",
            "Dùng sai đại từ nhân xưng, sở hữu hoặc tân ngữ"),

    REFLEXIVE_PRONOUN("Đại từ phản thân",
            "Dùng sai hoặc thiếu đại từ phản thân"),

    POSSESSIVE("Sở hữu",
            "Nhầm lẫn giữa dạng sở hữu và dạng viết tắt"),

    DEMONSTRATIVE("Chỉ định từ",
            "Dùng sai chỉ định từ theo số ít/số nhiều hoặc khoảng cách"),

    QUANTIFIER("Lượng từ",
            "Dùng sai lượng từ với danh từ đếm được/không đếm được"),

    DETERMINER("Hạn định từ",
            "Dùng sai hạn định từ trong câu"),

    // ===== VERB (9) =====
    IRREGULAR_PAST("Quá khứ bất quy tắc",
            "Chia sai dạng quá khứ của động từ bất quy tắc"),

    IRREGULAR_PAST_PARTICIPLE("Quá khứ phân từ bất quy tắc",
            "Chia sai dạng quá khứ phân từ của động từ bất quy tắc"),

    MODAL_VERB("Động từ khiếm khuyết",
            "Dùng sai cấu trúc sau động từ khiếm khuyết"),

    GERUND_INFINITIVE("V-ing / to-V",
            "Dùng sai dạng danh động từ hoặc động từ nguyên thể"),

    PASSIVE_VOICE("Câu bị động",
            "Chia sai cấu trúc câu bị động"),

    CAUSATIVE("Câu sai khiến",
            "Dùng sai cấu trúc câu sai khiến"),

    REPORTED_SPEECH("Câu tường thuật",
            "Không lùi thì hoặc sai cấu trúc khi tường thuật"),

    CONDITIONAL("Câu điều kiện",
            "Dùng sai cấu trúc câu điều kiện"),

    WISH_CLAUSE("Câu ước (wish)",
            "Dùng sai cấu trúc câu ước"),

    // ===== NATURALNESS (4) =====
    VIETLISH("Tiếng Anh kiểu Việt",
            "Dịch sát nghĩa tiếng Việt gây thiếu tự nhiên trong tiếng Anh"),

    LITERAL_TRANSLATION("Dịch word-by-word",
            "Dịch từng từ một thay vì dịch theo cụm nghĩa"),

    FORMALITY("Sai mức trang trọng",
            "Dùng từ ngữ không phù hợp với mức độ trang trọng của ngữ cảnh"),

    AWKWARD_PHRASING("Diễn đạt lủng củng",
            "Câu đúng ngữ pháp nhưng cách diễn đạt thiếu tự nhiên");

    // ===== FIELDS =====
    private final String displayName;
    private final String description;

    ErrorSubtype(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    // ===== HELPER METHODS =====

    /**
     * Build errorKey từ category + subtype
     * VD: (TENSE, PRESENT_SIMPLE) → "TENSE_PRESENT_SIMPLE"
     */
    public static String buildErrorKey(ErrorCategory category, ErrorSubtype subtype) {
        return category.name() + "_" + subtype.name();
    }

    /**
     * Build errorKey từ string (dùng khi đọc từ DB)
     */
    public static String buildErrorKey(String category, String subtype) {
        return category.toUpperCase() + "_" + subtype.toUpperCase();
    }

    /**
     * Parse subtype an toàn từ string (có fallback)
     */
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