package com.englishlearning.backend.constant;

import java.util.List;
import java.util.Map;

public class PromptConstants {

    // ========================================
    // 0. CONSTANTS
    // ========================================
    public static final int MAX_PREVIOUS_SENTENCES = 10;

    // ========================================
    // 1. LEVEL DESCRIPTIONS
    // ========================================
    public static final Map<String, String> LEVEL = Map.of(
            "A1", "Trình độ A1: Hiện tại đơn, \"to be\". Câu đơn, không mệnh đề phụ. Độ dài 5-8 từ.",
            "A2", "Trình độ A2: Quá khứ đơn, hiện tại tiếp diễn. Câu ghép (and, but, because). Độ dài 8-12 từ.",
            "B1", "Trình độ B1: Hiện tại hoàn thành, quá khứ hoàn thành. Câu phức (when, if, although). Độ dài 12-15 từ.",
            "B2", "Trình độ B2: Tương lai hoàn thành, bị động, điều kiện loại 2. Độ dài 15-18 từ.",
            "C1", "Trình độ C1: Đảo ngữ, câu chẻ, điều kiện hỗn hợp. Độ dài 18-20 từ.",
            "C2", "Trình độ C2: Subjunctive, inversion, cấu trúc học thuật. Độ dài 20-25 từ."
    );

    // ========================================
    // 2. TOPIC DESCRIPTIONS
    // ========================================
    public static final Map<String, String> TOPIC = Map.ofEntries(
            Map.entry("FAMILY",
                    "Gia đình: giới thiệu các thành viên, công việc của bố mẹ, anh chị em, " +
                            "các hoạt động gia đình, thói quen sinh hoạt, tình cảm gia đình, " +
                            "những sự kiện thường gặp trong gia đình. " +
                            "TRÁNH: liệt kê dài dòng, 'đang có', câu quá formal."),

            Map.entry("WORK",
                    "Công việc: nghề nghiệp, môi trường làm việc, đồng nghiệp, cấp trên, " +
                            "công việc hằng ngày, cuộc họp, nhiệm vụ, lịch làm việc, áp lực công việc, " +
                            "định hướng nghề nghiệp. " +
                            "TRÁNH: câu quá formal, 'đang làm việc', liệt kê nhiệm vụ dài dòng."),

            Map.entry("TRAVEL",
                    "Du lịch: địa điểm du lịch, kế hoạch chuyến đi, phương tiện di chuyển, " +
                            "đặt vé, đặt khách sạn, tham quan, trải nghiệm du lịch, kỳ nghỉ, " +
                            "những tình huống thường gặp khi đi du lịch. " +
                            "TRÁNH: liệt kê địa điểm dài dòng, 'đang đi du lịch'."),

            Map.entry("SHOPPING",
                    "Mua sắm: mua quần áo, giày dép, đồ điện tử, lựa chọn sản phẩm, " +
                            "hỏi giá, mặc cả, giảm giá, thanh toán, mua sắm trực tuyến, " +
                            "trao đổi với nhân viên bán hàng. " +
                            "TRÁNH: 'đang mua', câu quá dài, liệt kê sản phẩm."),

            Map.entry("FOOD",
                    "Đồ ăn và thức uống: món yêu thích, ăn sáng/trưa/tối, đi nhà hàng, " +
                            "gọi món, nấu ăn đơn giản, khen chê món, thói quen ăn uống, chọn món. " +
                            "TRÁNH: liệt kê nguyên liệu/công thức dài dòng, 'đang nấu ăn'."),

            Map.entry("HEALTH",
                    "Sức khỏe: tình trạng sức khỏe, triệu chứng bệnh, thói quen lành mạnh, " +
                            "chế độ ăn uống, tập thể dục, nghỉ ngơi, khám bệnh, bệnh viện, bác sĩ, " +
                            "chăm sóc sức khỏe. " +
                            "TRÁNH: 'đang bị bệnh', câu quá dài, liệt kê triệu chứng."),

            Map.entry("EDUCATION",
                    "Giáo dục và học tập: học ngoại ngữ, kiến thức, khóa học, phương pháp học tập, " +
                            "bài tập, kỳ thi, kỹ năng mới, học trực tuyến, mục tiêu học tập. " +
                            "TRÁNH: liệt kê môn học dài dòng, câu quá formal."),

            Map.entry("TECHNOLOGY",
                    "Công nghệ trong đời sống: dùng điện thoại, máy tính, mạng xã hội, " +
                            "ứng dụng, internet, nhắn tin, gọi video, xem phim, chơi game, " +
                            "thiết bị điện tử. " +
                            "TRÁNH: thuật ngữ kỹ thuật phức tạp, 'trí tuệ nhân tạo', 'lập trình', câu quá dài."),

            Map.entry("HOBBIES",
                    "Sở thích cá nhân: nghe nhạc, xem phim, đọc sách, chơi thể thao, " +
                            "chơi trò chơi, chụp ảnh, nấu ăn, du lịch, làm vườn, " +
                            "các hoạt động giải trí trong thời gian rảnh. " +
                            "TRÁNH: liệt kê sở thích dài dòng."),

            Map.entry("DAILY_ROUTINE",
                    "Thói quen và hoạt động hằng ngày: thức dậy, đánh răng, tắm rửa, ăn sáng, " +
                            "đi học, đi làm, làm việc nhà, tập thể dục, nghỉ ngơi, đi ngủ. " +
                            "TRÁNH: 'đang thức dậy', câu quá dài, liệt kê hoạt động."),

            Map.entry("DAILY_CONVERSATION",
                    "Giao tiếp hàng ngày: hỏi thăm, rủ rê, nhờ vả, phản hồi, kể chuyện, " +
                            "từ chối, hẹn gặp, chia sẻ cảm xúc, đưa ra ý kiến, hỏi đáp thông thường. " +
                            "Câu ngắn, khẩu ngữ tự nhiên như bạn bè nói chuyện. " +
                            "TRÁNH: cảm ơn/xin lỗi sáo rỗng, 'đang cảm ơn', 'người bạn', câu quá dài."),

            Map.entry("RESTAURANT",
                    "Nhà hàng hoặc quán cà phê: đặt bàn, gọi món, hỏi thực đơn, yêu cầu thêm món, " +
                            "hỏi thành phần món ăn, phàn nàn về dịch vụ, yêu cầu thanh toán, " +
                            "giao tiếp với nhân viên phục vụ. " +
                            "TRÁNH: 'đang gọi món', câu quá formal, liệt kê món ăn."),

            Map.entry("SCHOOL",
                    "Môi trường học đường: trường học, lớp học, giáo viên, bạn bè, môn học, " +
                            "thời khóa biểu, nội quy, hoạt động ngoại khóa, giờ ra chơi, bài kiểm tra, " +
                            "những trải nghiệm ở trường. " +
                            "TRÁNH: liệt kê môn học dài dòng, câu quá formal."),

            Map.entry("FRIENDS",
                    "Bạn bè và tình bạn: giới thiệu bạn bè, miêu tả tính cách, gặp gỡ, trò chuyện, " +
                            "đi chơi, tổ chức sinh nhật, mời bạn tham gia hoạt động, giúp đỡ bạn bè, " +
                            "chia sẻ những kỷ niệm. " +
                            "TRÁNH: 'người bạn' formal, câu quá dài, liệt kê hoạt động.")
    );

    // ========================================
    // 3. SENTENCE TYPE DESCRIPTIONS
    // ========================================
    public static final Map<String, String> SENTENCE_TYPE_DESC = Map.of(
            "QUESTION", """
                BẮT BUỘC: câu hỏi. PHẢI có dấu "?" cuối câu. PHẢI có từ để hỏi (ai, gì, nào, đâu, khi nào, tại sao, bao nhiêu, có...không, chưa).
                KHÔNG được là câu trần thuật/cầu khiến/cảm thán.
                """,
            "ANSWER", """
                BẮT BUỘC: câu trần thuật/cầu khiến/cảm thán. TUYỆT ĐỐI KHÔNG có "?" cuối câu.
                KHÔNG có từ để hỏi (ai, gì, nào, đâu, khi nào, tại sao, bao nhiêu, có...không, chưa).
                KHÔNG được sinh câu hỏi dù bất kỳ lý do gì.
                """,
            "RANDOM", "Chọn ngẫu nhiên 1 trong 2 loại: QUESTION hoặc ANSWER."
    );

    // ========================================
    // 4. GENERATE PROMPT TEMPLATE
    // ========================================
    public static final String GENERATE_PROMPT_TEMPLATE = """
        Bạn là giáo viên tiếng Anh. Tạo 1 câu tiếng Việt để học viên dịch sang tiếng Anh.

        === RÀNG BUỘC CỨNG ===
        - %s
        - %s
        - %s

        === TỪ VỰNG BẮT BUỘC ===
        %s

        === CÂU ĐÃ HỎI ===
        %s

        === QUY TẮC TẠO CÂU ===
        1. Câu tiếng Việt 100%% tiếng Việt — KHÔNG trộn từ tiếng Anh.
        2. Từ vựng bắt buộc PHẢI được dịch sang tiếng Việt trong câu.
        3. Đọc tự nhiên như người thật đang nói chuyện — KHÔNG gượng ép ghép từ.
        4. KHÔNG lặp ý tưởng / cấu trúc / trạng ngữ thời gian với câu đã hỏi.
        5. Trước khi viết, nghĩ ra 1 bối cảnh cụ thể (bữa ăn sáng hôm qua, lúc dọn nhà, khi đi làm về...)
           — bối cảnh phải KHÁC các câu trước.

        === QUY TẮC TỰ NHIÊN (QUAN TRỌNG NHẤT) ===
        1. Câu phải là câu NGƯỜI VIỆT THẬT SỰ NÓI hàng ngày — như bạn bè nói chuyện.
        2. KHÔNG dùng "đang + cảm xúc" (đang cảm ơn, đang xin lỗi).
        3. KHÔNG lặp chủ ngữ "tôi... tôi..." trong câu ngắn.
        4. KHÔNG nhồi forcedWords nếu gượng — thà câu ngắn tự nhiên.
        5. ĐA DẠNG: mỗi câu dùng cấu trúc/ngữ cảnh KHÁC câu trước.
        6. Ưu tiên câu HỎI, RỦ RÊ, CHIA SẺ hơn câu sáo rỗng.

        === JSON OUTPUT ===
        {
          "vietnameseSentence": "câu tiếng Việt",
          "expectedAnswer": "câu tiếng Anh đúng",
          "sentenceType": "QUESTION|ANSWER|RANDOM",
          "usedVocabulary": ["từ tiếng Anh đã dùng"]
        }
        """;

    // ========================================
    // 5. EVALUATE PROMPT TEMPLATE
    // ========================================
    public static final String EVALUATE_PROMPT_TEMPLATE = """
        Bạn là giáo viên tiếng Anh chấm bài dịch.

        === BÀI LÀM ===
        - Câu gốc: %s
        - Đáp án mẫu: %s
        - Bài dịch: %s
        - Trình độ: %s

        === TRIẾT LÝ CHẤM ===
        - Đây là BÀI DỊCH, không phải so khớp đáp án. Đáp án mẫu chỉ là MỘT trong nhiều cách đúng.
        - KHÔNG phải lỗi: từ đồng nghĩa (often/usually), cấu trúc tương đương (I think = In my opinion),
          determiner thay thế (the/this store), phong cách khác.
        - LÀ lỗi: vi phạm ngữ pháp cứng, sai nghĩa, sai chính tả, dùng từ sai ngữ cảnh.

        === CHẤP NHẬN BIẾN THỂ Ở LEVEL THẤP (A1/A2) ===
        Với level A1/A2, KHÔNG bắt lỗi các trường hợp sau (vì người bản xứ vẫn hiểu):
        - Thiếu giới từ nếu nghĩa vẫn rõ: "welcome the colleague the company" thay vì "to the company"
        - Thiếu giới từ sau động từ nếu ngữ cảnh rõ: "apologize you" → vẫn có thể chấp nhận ở A1, chỉ MEDIUM ở A2
        - Sai thì nhẹ nhưng có trạng ngữ thời gian rõ: "I welcome him yesterday" — chỉ LOW/MEDIUM, không HIGH
        - Dùng từ đồng nghĩa: "say bye" vs "say goodbye", "big" vs "large", "night" vs "evening"
        CHỈ bắt lỗi HIGH khi: sai nghĩa hoàn toàn, sai cấu trúc khiến người bản xứ KHÔNG hiểu được.
        Ở level A1/A2, ưu tiên ĐỘNG VIÊN — chỉ bắt lỗi thực sự nghiêm trọng.

        === 3 CÂU HỎI CHỐNG BẮT LỖI OAN (trả lời trước khi thêm error) ===
        1. Người bản xứ đọc câu này có hiểu đúng không? → CÓ → KHÔNG phải lỗi.
        2. Câu này vi phạm quy tắc ngữ pháp CỨNG nào? → KHÔNG → KHÔNG phải lỗi.
        3. Nếu thay ngữ cảnh, câu này có đúng không? → CÓ → KHÔNG phải lỗi.
        Chỉ khi cả 3 đều "KHÔNG" → mới thêm vào errors.

        === LUẬT CHỐNG ẢO GIÁC ===
        - Nếu userText VÀ correctText GIỐNG HỆT NHAU (hoặc chỉ khác dấu chấm/viết hoa)
          → KHÔNG tạo lỗi.
        - Nếu học viên viết đúng chính tả + ngữ pháp → TUYỆT ĐỐI KHÔNG báo lỗi.

        === LUẬT MẠO TỪ ===
        - Danh từ không đếm được (coffee, tea): nói chung không cần "the",
          nhưng ngữ cảnh xác định ("the coffee I spilled") dùng "the" là ĐÚNG.
        - KHÔNG bắt lỗi thừa/thiếu mạo từ nếu cả 2 cách đều chấp nhận.

        === VÍ DỤ ===
        1. Gốc: "Tôi thường ăn sáng lúc 7 giờ" | Đáp án: "I usually have breakfast at 7 AM"
           | Bài làm: "I often have breakfast at 7 o'clock" → ĐÚNG, không lỗi.
        2. Bài làm: "She offten cooks" → LỖI: SPELLING "offten" → "often", severity MEDIUM.
        3. Bài làm: "She cook every morning" → LỖI: STRUCTURE "She cook" → "She cooks", severity HIGH.
        4. Bài làm: "We communicate each other by social media" → 2 LỖI:
           - PREPOSITION: thiếu "with" sau "communicate" (HIGH)
           - PREPOSITION: "by" → "through" (MEDIUM)
           → 2 lỗi cùng category nhưng errorType KHÁC NHAU.
        5. Bài làm A2: "I welcome new colleague the company" → KHÔNG bắt lỗi "thiếu to"
           (vẫn hiểu được, chỉ góp ý trong feedback, không thêm error).
        6. Bài làm A2: "I have to apologize you" → thiếu "to" sau "apologize" → LỖI PREPOSITION,
           severity MEDIUM (không HIGH vì nghĩa vẫn rõ).

        === ERROR TAXONOMY ===
        Bước 1 — errorCategory (1 trong 12): TENSE, ARTICLE, PREPOSITION, CONJUNCTION, STRUCTURE,
          POS, VERB, NATURALNESS, SPELLING, WORD_CHOICE, MEANING, PUNCTUATION.
        Bước 2 — errorType (BẮT BUỘC DỊCH SANG TIẾNG VIỆT, ≤ 12 từ, CỤ THỂ):
          ⚠️ TUYỆT ĐỐI KHÔNG DÙNG TIẾNG ANH CHO errorType. Phải dịch sang tiếng Việt.
          - Lỗi MEANING → ghi: "Sai nghĩa hoàn toàn", "Dịch sai ý câu gốc"
          - Lỗi TENSE → ghi: "Sai thì: 'find' → 'found'"
          - Lỗi PREPOSITION → ghi: "Thiếu giới từ 'with' sau 'communicate'"
          - Lỗi SPELLING → ghi: "Viết sai chính tả: 'offten' → 'often'"
          - Lỗi STRUCTURE → ghi: "Hòa hợp chủ ngữ - động từ"
          - Lỗi WORD_CHOICE → ghi: "Dùng sai từ vựng: 'plate' → 'fork'"
          - Mỗi lỗi PHẢI có errorType KHÁC NHAU.
        Bước 3 — severity: HIGH | MEDIUM | LOW.

        === JSON OUTPUT ===
        {
          "isCorrect": boolean,
          "score": number (0-100),
          "naturalnessScore": number (0-100),
          "feedback": "TIẾNG VIỆT",
          "betterAnswers": ["câu tiếng Anh hay hơn"],
          "errors": [
            {
              "errorType": "Hòa hợp chủ ngữ - động từ",
              "errorCategory": "STRUCTURE",
              "userText": "She cook",
              "correctText": "She cooks",
              "explanation": "TIẾNG VIỆT",
              "severity": "HIGH"
            }
          ]
        }
        """;

    // ========================================
    // 6. HELPER METHODS
    // ========================================

    public static String getLevelDescription(String level) {
        return LEVEL.getOrDefault(level, "Trình độ: " + level);
    }

    public static String getTopicDescription(String topic) {
        return TOPIC.getOrDefault(topic, "Chủ đề: " + topic);
    }

    public static String getSentenceTypeDescription(String sentenceType) {
        if (sentenceType == null || sentenceType.isEmpty()) {
            return SENTENCE_TYPE_DESC.get("RANDOM");
        }
        return SENTENCE_TYPE_DESC.getOrDefault(
                sentenceType.toUpperCase(),
                SENTENCE_TYPE_DESC.get("RANDOM")
        );
    }

    private static String formatPreviousSentences(List<String> previousSentences) {
        if (previousSentences == null || previousSentences.isEmpty()) {
            return "(Chưa có câu nào — đây là câu đầu tiên)";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Các câu ĐÃ HỎI (TUYỆT ĐỐI KHÔNG lặp lại ý tưởng, cấu trúc, hay trạng ngữ thời gian):\n");
        for (int i = 0; i < previousSentences.size(); i++) {
            sb.append(i + 1).append(". ").append(previousSentences.get(i)).append("\n");
        }
        sb.append("\n⚠️ Nếu câu trước dùng \"buổi sáng\" → câu này phải dùng ngữ cảnh khác (chiều, tối, lúc đang làm gì...).\n");
        sb.append("⚠️ Nếu câu trước nói về \"ăn sáng\" → câu này phải nói về chủ đề khác trong cùng topic.\n");
        return sb.toString();
    }

    private static String formatForcedWordsBlock(List<String> forcedWords) {
        if (forcedWords == null || forcedWords.isEmpty()) {
            return "Không có từ bắt buộc.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Câu tiếng Việt PHẢI chứa nghĩa tiếng Việt của các từ sau:\n");
        for (String w : forcedWords) {
            sb.append("- \"").append(w).append("\" → phải xuất hiện nghĩa tiếng Việt trong câu\n");
        }
        sb.append("\nKHÔNG giữ nguyên từ tiếng Anh trong câu tiếng Việt. ")
                .append("Từ tiếng Anh CHỈ có trong expectedAnswer.");
        return sb.toString();
    }

    // ========================================
    // 7. FORMAT METHODS
    // ========================================

    public static String formatGeneratePrompt(
            String level, String topic, String sentenceType,
            List<String> previousSentences, List<String> forcedWords) {

        String normalizedType = (sentenceType != null && !sentenceType.isEmpty())
                ? sentenceType.toUpperCase()
                : "RANDOM";

        String levelBlock = getLevelDescription(level);
        String topicBlock = getTopicDescription(topic);
        String sentenceTypeBlock = "Loại câu: " + normalizedType + "\n"
                + getSentenceTypeDescription(normalizedType);

        return String.format(
                GENERATE_PROMPT_TEMPLATE,
                levelBlock,
                topicBlock,
                sentenceTypeBlock,
                formatForcedWordsBlock(forcedWords),
                formatPreviousSentences(previousSentences)
        );
    }

    public static String formatEvaluatePrompt(
            String vietnameseSentence, String studentAnswer,
            String expectedAnswer, String level) {

        return String.format(
                EVALUATE_PROMPT_TEMPLATE,
                vietnameseSentence,
                expectedAnswer,
                studentAnswer,
                level
        );
    }
}