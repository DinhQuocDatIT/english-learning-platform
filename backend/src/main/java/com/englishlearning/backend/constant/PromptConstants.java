package com.englishlearning.backend.constant;

import java.util.Map;

public class PromptConstants {

    // ========================================
    // 1. LEVEL DESCRIPTIONS (Mô tả trình độ)
    // ========================================
    public static final Map<String, String> LEVEL = Map.of(
            "A1", """
            TRÌNH ĐỘ A1 (Sơ cấp):
            - Thì: Hiện tại đơn, To be
            - Câu: Đơn giản, không mệnh đề phụ
            - Từ vựng: Gia đình, thức ăn, trường học
            - Độ dài: 5-8 từ
            """,

            "A2", """
            TRÌNH ĐỘ A2 (Sơ cấp+):
            - Thì: Hiện tại tiếp diễn, Quá khứ đơn
            - Câu: Ghép đơn giản (and, but, because)
            - Từ vựng: Du lịch, mua sắm, thói quen
            - Độ dài: 8-12 từ
            """,

            "B1", """
            TRÌNH ĐỘ B1 (Trung cấp):
            - Thì: Hiện tại hoàn thành, Quá khứ hoàn thành
            - Câu: Phức (when, if, although)
            - Từ vựng: Công việc, sức khỏe, giáo dục
            - Độ dài: 12-15 từ
            """,

            "B2", """
            TRÌNH ĐỘ B2 (Trung cấp+):
            - Thì: Tương lai hoàn thành, Quá khứ tiếp diễn
            - Câu: Bị động, điều kiện loại 2
            - Từ vựng: Học thuật, môi trường, xã hội
            - Độ dài: 15-18 từ
            """,

            "C1", """
            TRÌNH ĐỘ C1 (Cao cấp):
            - Thì: Đảo ngữ, câu chẻ
            - Câu: Điều kiện hỗn hợp
            - Từ vựng: Thành ngữ, collocations
            - Độ dài: 18-20 từ
            """,

            "C2", """
            TRÌNH ĐỘ C2 (Thành thạo):
            - Thì: Subjunctive, inversion
            - Câu: Cấu trúc học thuật
            - Từ vựng: Chuyên ngành, idioms
            - Độ dài: 20-25 từ
            """
    );

    // ========================================
    // 2. TOPIC DESCRIPTIONS (Mô tả chủ đề)
    // ========================================
    public static final Map<String, String> TOPIC = Map.ofEntries(
            Map.entry("FAMILY", """
            CHỦ ĐỀ: GIA ĐÌNH
            Từ vựng: parents, children, siblings, grandparents, relatives
            Cấu trúc: describe family members, family activities
            Ví dụ: "My family has 4 members."
            """),

            Map.entry("WORK", """
            CHỦ ĐỀ: CÔNG VIỆC
            Từ vựng: job, career, office, colleague, boss, salary
            Cấu trúc: describe daily work, job responsibilities
            Ví dụ: "I work as a software engineer."
            """),

            Map.entry("TRAVEL", """
            CHỦ ĐỀ: DU LỊCH
            Từ vựng: hotel, flight, ticket, reservation, airport, luggage
            Cấu trúc: make reservations, ask for directions
            Ví dụ: "I have booked a room at the hotel."
            """),

            Map.entry("SHOPPING", """
            CHỦ ĐỀ: MUA SẮM
            Từ vựng: supermarket, price, discount, receipt, cash
            Cấu trúc: ask for prices, describe products
            Ví dụ: "How much does this cost?"
            """),

            Map.entry("FOOD", """
            CHỦ ĐỀ: ĐỒ ĂN
            Từ vựng: restaurant, menu, delicious, cook, ingredients
            Cấu trúc: order food, describe cooking
            Ví dụ: "I would like to order a pizza."
            """),

            Map.entry("HEALTH", """
            CHỦ ĐỀ: SỨC KHỎE
            Từ vựng: doctor, hospital, medicine, exercise, healthy
            Cấu trúc: describe symptoms, give advice
            Ví dụ: "I have a headache."
            """),

            Map.entry("EDUCATION", """
            CHỦ ĐỀ: GIÁO DỤC
            Từ vựng: school, university, teacher, student, exam
            Cấu trúc: talk about studies, describe school life
            Ví dụ: "I am studying English."
            """),

            Map.entry("TECHNOLOGY", """
            CHỦ ĐỀ: CÔNG NGHỆ
            Từ vựng: computer, smartphone, internet, software, app
            Cấu trúc: describe using technology, talk about gadgets
            Ví dụ: "I use my smartphone every day."
            """),

            Map.entry("HOBBIES", """
            CHỦ ĐỀ: SỞ THÍCH
            Từ vựng: hobby, sport, music, reading, painting
            Cấu trúc: describe free time activities
            Ví dụ: "I enjoy reading books."
            """),

            Map.entry("DAILY_ROUTINE", """
            CHỦ ĐỀ: THÓI QUEN HÀNG NGÀY
            Từ vựng: morning, afternoon, evening, breakfast, work
            Cấu trúc: describe daily schedule
            Ví dụ: "I wake up at 6 AM."
            """),

            Map.entry("DAILY_CONVERSATION", """
            CHỦ ĐỀ: HỘI THOẠI HÀNG NGÀY
            Từ vựng: hello, goodbye, thank you, sorry, please, excuse me
            Cấu trúc: greetings, introductions, basic conversations
            Ví dụ: "How are you today?"
            """),

            Map.entry("RESTAURANT", """
            CHỦ ĐỀ: NHÀ HÀNG
            Từ vựng: menu, order, bill, waiter, table, reservation, dish, drink
            Cấu trúc: ordering food, asking about menu, paying bill
            Ví dụ: "I would like to order a steak."
            """),

            Map.entry("SCHOOL", """
            CHỦ ĐỀ: TRƯỜNG HỌC
            Từ vựng: classroom, teacher, student, homework, exam, lesson, subject
            Cấu trúc: talking about school subjects, daily school routine
            Ví dụ: "I have Math class at 8 AM."
            """),

            Map.entry("FRIENDS", """
            CHỦ ĐỀ: BẠN BÈ
            Từ vựng: friend, friendship, hang out, chat, socialize, trust, share
            Cấu trúc: describing friends, talking about activities with friends
            Ví dụ: "My best friend is very kind."
            """)
    );

    // ========================================
    // 3. ERROR TAXONOMY (Phân loại lỗi chi tiết)
    // ========================================
    public static final String ERROR_TAXONOMY = """
        
        ===== PHÂN LOẠI LỖI (BẮT BUỘC - 2 CẤP) =====
        
        Mỗi lỗi PHẢI được phân loại theo 2 cấp: errorCategory + errorSubtype.
        
        ─────────────────────────────────────────
        CẤP 1 — errorCategory (chọn 1 trong 8):
        ─────────────────────────────────────────
        - TENSE         : Lỗi về thì
        - ARTICLE       : Lỗi về mạo từ (a/an/the)
        - PREPOSITION   : Lỗi về giới từ
        - CONJUNCTION   : Lỗi về liên từ
        - STRUCTURE     : Lỗi về cấu trúc câu
        - POS           : Lỗi về từ loại (danh/tính/trạng/đại từ)
        - VERB          : Lỗi về dạng động từ (bị động, tường thuật...)
        - NATURALNESS   : Lỗi về độ tự nhiên
        
        ─────────────────────────────────────────
        CẤP 2 — errorSubtype (chọn theo category):
        ─────────────────────────────────────────
        
        Nếu TENSE:
          PRESENT_SIMPLE, PRESENT_CONTINUOUS, PRESENT_PERFECT, PRESENT_PERFECT_CONTINUOUS,
          PAST_SIMPLE, PAST_CONTINUOUS, PAST_PERFECT, PAST_PERFECT_CONTINUOUS,
          FUTURE_SIMPLE, FUTURE_CONTINUOUS, FUTURE_PERFECT, FUTURE_PERFECT_CONTINUOUS,
          NEAR_FUTURE_GOING_TO, MIXED_TENSE
        
        Nếu ARTICLE:
          A_AN, THE, ZERO_ARTICLE, A_AN_VS_THE
        
        Nếu PREPOSITION:
          TIME_IN, TIME_ON, TIME_AT,
          PLACE_IN, PLACE_ON, PLACE_AT,
          DIRECTION_TO, MOVEMENT_INTO,
          AGENT_BY, INSTRUMENT_WITH,
          PHRASAL_VERB, ADJECTIVE_PREP, VERB_PREP
        
        Nếu CONJUNCTION:
          COORDINATING, SUBORDINATING, CORRELATIVE, CONNECTING_ADVERB, WRONG_CONJUNCTION
        
        Nếu STRUCTURE:
          WORD_ORDER, SUBJECT_VERB_AGREEMENT, MISSING_SUBJECT, MISSING_VERB,
          MISSING_OBJECT, DOUBLE_NEGATIVE, DOUBLE_VERB, REDUNDANCY, FRAGMENT, RUN_ON
        
        Nếu POS:
          NOUN_ADJECTIVE, ADJECTIVE_ADVERB, VERB_NOUN, PRONOUN, REFLEXIVE_PRONOUN,
          POSSESSIVE, DEMONSTRATIVE, QUANTIFIER, DETERMINER
        
        Nếu VERB:
          IRREGULAR_PAST, IRREGULAR_PAST_PARTICIPLE, MODAL_VERB, GERUND_INFINITIVE,
          PASSIVE_VOICE, CAUSATIVE, REPORTED_SPEECH, CONDITIONAL, WISH_CLAUSE
        
        Nếu NATURALNESS:
          VIETLISH, LITERAL_TRANSLATION, FORMALITY, AWKWARD_PHRASING
        
        ─────────────────────────────────────────
        VÍ DỤ PHÂN LOẠI ĐÚNG:
        ─────────────────────────────────────────
        - "She go to school"      → TENSE / PRESENT_SIMPLE
        - "I go yesterday"        → TENSE / PAST_SIMPLE
        - "in Monday"             → PREPOSITION / TIME_ON
        - "at 2020"               → PREPOSITION / TIME_IN
        - "a apple"               → ARTICLE / A_AN
        - "I very like it"        → NATURALNESS / VIETLISH
        - "Because...so..."       → CONJUNCTION / WRONG_CONJUNCTION
        - "make him to go"        → VERB / CAUSATIVE
        - "run quick"             → POS / ADJECTIVE_ADVERB
        - "Me go to school"       → POS / PRONOUN
        - "She happy"             → STRUCTURE / MISSING_VERB
        - "is wrote"              → VERB / PASSIVE_VOICE
        - "If I would"            → VERB / CONDITIONAL
        - "return back"           → STRUCTURE / REDUNDANCY
        
        ─────────────────────────────────────────
        LƯU Ý QUAN TRỌNG:
        ─────────────────────────────────────────
        - Mỗi lỗi CHỈ thuộc 1 errorCategory và 1 errorSubtype
        - errorType PHẢI TRÙNG với errorCategory (VD: "TENSE")
        - explanation viết bằng TIẾNG VIỆT, ngắn gọn, dễ hiểu
        - Nếu lỗi không khớp subtype nào, dùng MIXED_TENSE cho TENSE
        """;

    // ========================================
    // 4. PROMPT TEMPLATES
    // ========================================

    public static final String GENERATE_PROMPT_TEMPLATE = """
        Bạn là giáo viên tiếng Anh 10 năm kinh nghiệm.
        Nhiệm vụ: Tạo câu tiếng Việt để học viên dịch sang tiếng Anh.
        
        === QUY TẮC ===
        1. Câu PHẢI phù hợp với trình độ học viên
        2. Câu PHẢI liên quan đến chủ đề đã chọn
        3. Câu PHẢI sử dụng từ vựng đã chỉ định (nếu có)
        4. Đáp án tiếng Anh PHẢI đúng ngữ pháp và tự nhiên
        5. Chỉ trả về JSON, KHÔNG text khác
        
        === THÔNG TIN ===
        - Trình độ: %s
        - Chủ đề: %s
        - Loại câu: %s
        - Từ vựng: %s
        - Điểm yếu: %s
        
        === HƯỚNG DẪN ===
        %s
        %s
        
        === JSON OUTPUT ===
        {
          "vietnameseSentence": "câu tiếng Việt",
          "expectedAnswer": "câu tiếng Anh đúng",
          "sentenceType": "QUESTION|ANSWER"
        }
        """;

    public static final String EVALUATE_PROMPT_TEMPLATE = """
        Bạn là giáo viên tiếng Anh chuyên đánh giá bài dịch.
        
        === QUY TẮC ===
        1. Feedback và explanation PHẢI bằng TIẾNG VIỆT
        2. Chỉ expectedAnswer và correctText là TIẾNG ANH
        3. Phân tích lỗi chi tiết, cụ thể
        4. Chỉ trả về JSON
        
        === NGỮ CẢNH ===
        - Câu tiếng Việt: %s
        - Bài dịch: %s
        - Đáp án đúng: %s
        - Trình độ: %s
        
        === HƯỚNG DẪN CHẤM ===
        %s
        
        %s
        
        === JSON OUTPUT ===
        {
          "isCorrect": boolean,
          "score": number (0-100),
          "naturalnessScore": number (0-100),
          "feedback": "string (TIẾNG VIỆT)",
          "betterAnswers": ["string"],
          "errors": [
            {
              "errorType": "TENSE|ARTICLE|PREPOSITION|CONJUNCTION|STRUCTURE|POS|VERB|NATURALNESS",
              "errorCategory": "TENSE|ARTICLE|PREPOSITION|CONJUNCTION|STRUCTURE|POS|VERB|NATURALNESS",
              "errorSubtype": "PRESENT_SIMPLE|PAST_SIMPLE|TIME_ON|A_AN|...",
              "userText": "phần sai (TIẾNG ANH)",
              "correctText": "phần đúng (TIẾNG ANH)",
              "explanation": "giải thích (TIẾNG VIỆT)",
              "severity": "HIGH|MEDIUM|LOW"
            }
          ]
        }
        """;

    public static final String EVALUATE_AND_GENERATE_PROMPT_TEMPLATE = """
        Bạn là giáo viên tiếng Anh chuyên đánh giá bài dịch và tạo câu tiếp theo.
        
        ⚠️ QUY TẮC BẮT BUỘC TUYỆT ĐỐI ⚠️
        1. TẤT CẢ feedback, explanation PHẢI bằng TIẾNG VIỆT
        2. CHỈ expectedAnswer, correctText, userText, betterAnswers là TIẾNG ANH
        3. PHẢI phân tích TỪNG LỖI một cách riêng biệt trong errors array
        4. NẾU CÓ LỖI thì errors array KHÔNG ĐƯỢC để trống
        5. Mỗi lỗi PHẢI có đủ 7 thành phần:
           errorType, errorCategory, errorSubtype, userText, correctText, explanation, severity
        6. KHÔNG được gộp nhiều lỗi vào 1 error
        7. Chỉ trả về JSON, KHÔNG có bất kỳ văn bản nào khác
        
        === NGỮ CẢNH ĐÁNH GIÁ ===
        - Câu tiếng Việt: %s
        - Bài dịch của học viên: %s
        - Đáp án đúng: %s
        - Trình độ: %s
        - Chủ đề: %s
        - Từ vựng yêu cầu: %s
        - Điểm yếu cần tập trung: %s
        
        === HƯỚNG DẪN THEO TRÌNH ĐỘ ===
        %s
        
        === HƯỚNG DẪN THEO CHỦ ĐỀ ===
        %s
        
        === HƯỚNG DẪN CHẤM ĐIỂM ===
        1. Đúng hoàn toàn, tự nhiên: 95-100 điểm
        2. Đúng, tự nhiên nhưng có lỗi nhỏ không ảnh hưởng nghĩa: 85-94 điểm
        3. Đúng ý nhưng sai ngữ pháp nhẹ: 70-84 điểm
        4. Đúng ý nhưng sai ngữ pháp nặng: 50-69 điểm
        5. Sai ý chính, hiểu sai nghĩa: 30-49 điểm
        6. Trả lời không liên quan hoặc bỏ trống: 0-29 điểm
        
        === MỨC ĐỘ NGHIÊM TRỌNG ===
        HIGH: Lỗi làm thay đổi nghĩa của câu
        MEDIUM: Lỗi ảnh hưởng đến độ tự nhiên nhưng không làm thay đổi nghĩa
        LOW: Lỗi nhỏ, không ảnh hưởng đến nghĩa
        
        === HƯỚNG DẪN VIẾT FEEDBACK ===
        - Feedback PHẢI là một đoạn văn TIẾNG VIỆT ngắn gọn, tổng kết các lỗi chính
        - Nêu rõ học viên đã làm đúng điểm nào và sai điểm nào
        - Đưa ra lời khuyên cụ thể để cải thiện
        
        === HƯỚNG DẪN TẠO CÂU TIẾP THEO ===
        1. Nếu học viên làm đúng (>70 điểm): tăng độ khó nhẹ
        2. Nếu học viên làm sai (<=70 điểm): tạo câu đơn giản hơn, tập trung vào lỗi sai
        3. Luôn sử dụng từ vựng đã chỉ định (nếu có)
        4. Câu tiếp theo PHẢI khác hoàn toàn với câu trước
        5. Độ dài câu phù hợp với level
        6. Nếu học viên có điểm yếu: ưu tiên tạo câu sửa lỗi đó
        
        %s
        
        === VÍ DỤ PHÂN TÍCH LỖI ĐÚNG ===
        Ví dụ câu sai: "If I have time, I will learn new language."
        Câu đúng: "If I had time, I would learn a new language."
        
        errors PHẢI trả về:
        [
          {
            "errorType": "VERB",
            "errorCategory": "VERB",
            "errorSubtype": "CONDITIONAL",
            "userText": "if I have",
            "correctText": "If I had",
            "explanation": "Đây là câu điều kiện loại 2, mệnh đề 'if' cần dùng quá khứ đơn ('had') thay vì hiện tại đơn ('have').",
            "severity": "HIGH"
          },
          {
            "errorType": "VERB",
            "errorCategory": "VERB",
            "errorSubtype": "CONDITIONAL",
            "userText": "I will learn",
            "correctText": "I would learn",
            "explanation": "Trong câu điều kiện loại 2, mệnh đề chính dùng 'would' + động từ nguyên mẫu.",
            "severity": "HIGH"
          },
          {
            "errorType": "ARTICLE",
            "errorCategory": "ARTICLE",
            "errorSubtype": "A_AN",
            "userText": "new language",
            "correctText": "a new language",
            "explanation": "Cần thêm mạo từ 'a' trước danh từ số ít 'language'.",
            "severity": "MEDIUM"
          }
        ]
        
        ⚠️ LƯU Ý QUAN TRỌNG:
        - errors là một MẢNG các đối tượng lỗi
        - MỖI LỖI là một object RIÊNG BIỆT
        - KHÔNG được gộp nhiều lỗi vào cùng một object
        - Nếu có 3 lỗi thì errors phải có 3 phần tử
        - Nếu không có lỗi thì errors là mảng rỗng []
        
        === ĐỊNH DẠNG JSON ===
        {
          "isCorrect": boolean,
          "score": number (0-100),
          "naturalnessScore": number (0-100),
          "feedback": "string (TIẾNG VIỆT - tóm tắt ngắn gọn)",
          "betterAnswers": ["câu tiếng Anh hay hơn"],
          "errors": [
            {
              "errorType": "TENSE|ARTICLE|PREPOSITION|CONJUNCTION|STRUCTURE|POS|VERB|NATURALNESS",
              "errorCategory": "TENSE|ARTICLE|PREPOSITION|CONJUNCTION|STRUCTURE|POS|VERB|NATURALNESS",
              "errorSubtype": "PRESENT_SIMPLE|PAST_SIMPLE|TIME_ON|A_AN|...",
              "userText": "phần sai (TIẾNG ANH)",
              "correctText": "phần đúng (TIẾNG ANH)",
              "explanation": "giải thích (TIẾNG VIỆT)",
              "severity": "HIGH|MEDIUM|LOW"
            }
          ],
          "nextQuestion": {
            "vietnameseSentence": "câu tiếp theo (TIẾNG VIỆT)",
            "expectedAnswer": "đáp án (TIẾNG ANH)",
            "sentenceType": "QUESTION|ANSWER"
          }
        }
        """;

    // ========================================
    // 5. HELPER METHODS
    // ========================================

    public static String getLevelDescription(String level) {
        return LEVEL.getOrDefault(level, "Trình độ: " + level + " - Tạo câu phù hợp.");
    }

    public static String getTopicDescription(String topic) {
        return TOPIC.getOrDefault(topic, "Chủ đề: " + topic + " - Tạo câu liên quan.");
    }

    public static String formatGeneratePrompt(
            String level, String topic, String sentenceType,
            String vocabularyWords, String weaknesses) {

        return String.format(
                GENERATE_PROMPT_TEMPLATE,
                level,
                topic,
                sentenceType,
                vocabularyWords != null && !vocabularyWords.isEmpty() ? vocabularyWords : "Không có",
                weaknesses != null && !weaknesses.isEmpty() ? weaknesses : "Không có",
                getLevelDescription(level),
                getTopicDescription(topic)
        );
    }

    public static String formatEvaluatePrompt(
            String vietnameseSentence, String studentAnswer,
            String expectedAnswer, String level) {

        return String.format(
                EVALUATE_PROMPT_TEMPLATE,
                vietnameseSentence,
                studentAnswer,
                expectedAnswer,
                level,
                getLevelDescription(level),
                ERROR_TAXONOMY   // ← ✅ THÊM TAXONOMY
        );
    }

    public static String formatEvaluateAndGeneratePrompt(
            String vietnameseSentence, String studentAnswer,
            String expectedAnswer, String level, String topic,
            String vocabularyWords, String weaknesses) {

        return String.format(
                EVALUATE_AND_GENERATE_PROMPT_TEMPLATE,
                vietnameseSentence,
                studentAnswer,
                expectedAnswer,
                level,
                topic,
                vocabularyWords != null && !vocabularyWords.isEmpty() ? vocabularyWords : "Không có",
                weaknesses != null && !weaknesses.isEmpty() ? weaknesses : "Không có",
                getLevelDescription(level),
                getTopicDescription(topic),
                ERROR_TAXONOMY   // ← ✅ THÊM TAXONOMY
        );
    }
}