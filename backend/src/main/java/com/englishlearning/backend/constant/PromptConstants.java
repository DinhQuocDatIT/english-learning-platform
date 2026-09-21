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
    // 2. TOPIC DESCRIPTIONS
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
            Phạm vi: Chào hỏi, giới thiệu, cảm ơn, xin lỗi, hỏi thăm, tạm biệt
            Từ vựng gợi ý: hello, goodbye, thank you, sorry, please, excuse me
            Cấu trúc câu:
              - Chào hỏi: "Xin chào, bạn khỏe không?"
              - Giới thiệu: "Tên tôi là Nam, rất vui được gặp bạn."
              - Cảm ơn: "Cảm ơn bạn rất nhiều vì đã giúp tôi."
              - Xin lỗi: "Xin lỗi, tôi đến muộn."
              - Hỏi thăm: "Bạn có khỏe không?"
              - Tạm biệt: "Hẹn gặp lại bạn ngày mai."
            KHÔNG BAO GỒM: nấu ăn, mua sắm, miêu tả thời tiết, kể chuyện
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
    // 3. SENTENCE TYPE DESCRIPTIONS
    // ========================================
    public static final Map<String, String> SENTENCE_TYPE_DESC = Map.of(
            "QUESTION", """
                ═══════════════════════════════════════
                LOẠI CÂU BẮT BUỘC: NGHI VẤN (CÂU HỎI)
                ═══════════════════════════════════════
                
                ✅ BẮT BUỘC:
                   - PHẢI có dấu "?" ở cuối câu
                   - PHẢI có từ để hỏi: ai, gì, nào, đâu, khi nào, tại sao,
                     như thế nào, bao nhiêu, mấy, có...không, chưa
                
                ✅ VÍ DỤ ĐÚNG:
                   - "Bạn ăn cơm chưa?"
                   - "Cô ấy tên là gì?"
                   - "Bạn đi đâu đấy?"
                   - "Hôm nay trời có mưa không?"
                
                ❌ VÍ DỤ SAI (bị cấm):
                   - "Mình ăn cơm rồi."     (trần thuật - không có ?)
                   - "Hãy ăn cơm đi."        (cầu khiến - không có ?)
                   - "Ôi cơm ngon quá!"      (cảm thán - không có ?)
                """,
            "ANSWER", """
                ═══════════════════════════════════════
                LOẠI CÂU BẮT BUỘC: TRẦN THUẬT (KHÔNG PHẢI CÂU HỎI)
                ═══════════════════════════════════════
                
                ⚠️ ĐÂY LÀ LOẠI CÂU BAO GỒM 3 DẠNG:
                1. TRẦN THUẬT (kể, thông báo): "Mình đã ăn cơm rồi."
                2. CẦU KHIẾN (yêu cầu, đề nghị): "Hãy ăn cơm đi."
                3. CẢM THÁN (bộc lộ cảm xúc): "Ôi, cơm ngon quá!"
                
                ✅ BẮT BUỘC:
                   - TUYỆT ĐỐI KHÔNG có dấu "?" ở cuối câu
                   - TUYỆT ĐỐI KHÔNG có từ để hỏi: ai, gì, nào, đâu, khi nào,
                     tại sao, như thế nào, bao nhiêu, mấy, có...không, chưa
                   - KHÔNG được sinh câu hỏi dù bất kỳ lý do gì
                
                ✅ VÍ DỤ ĐÚNG:
                   - "Tôi uống cà phê vào buổi sáng."
                   - "Cô ấy làm việc ở văn phòng."
                   - "Hôm nay trời đẹp."
                   - "Mình đã ăn cơm rồi."
                   - "Hãy ăn cơm đi."
                   - "Ôi, cơm ngon quá!"
                
                ❌ VÍ DỤ SAI (bị cấm):
                   - "Bạn uống cà phê chưa?"      (có "?" + "chưa")
                   - "Cô ấy tên là gì?"            (có "?" + "gì")
                   - "Bạn khỏe không?"             (có "?" + "không")
                   - "Hôm nay trời có mưa không?"  (có "?" + "không")
                
                ⚠️ NHẮC LẠI: Nếu user chọn "ANSWER", CHỈ sinh câu trần thuật.
                TUYỆT ĐỐI KHÔNG tự ý thêm câu hỏi xen kẽ.
                """,
            "RANDOM", """
                ═══════════════════════════════════════
                LOẠI CÂU: NGẪU NHIÊN
                ═══════════════════════════════════════
                Chọn ngẫu nhiên 1 trong 2 loại:
                - NGHI VẤN (câu hỏi)
                - TRẦN THUẬT (trần thuật/cầu khiến/cảm thán)
                """
    );

    // ========================================
    // 4. ERROR TAXONOMY
    // ========================================
    public static final String ERROR_TAXONOMY = """
        
        ===== PHÂN LOẠI LỖI (2 CẤP) =====
        
        CẤP 1 — errorCategory (chọn 1 trong 12):
        - TENSE, ARTICLE, PREPOSITION, CONJUNCTION, STRUCTURE,
          POS, VERB, NATURALNESS, SPELLING, WORD_CHOICE, MEANING, PUNCTUATION
        
        CẤP 2 — errorSubtype (theo category):
        - SPELLING: TYPO, MISSING_LETTER, EXTRA_LETTER, WRONG_LETTER,
                    HOMOPHONE, CAPITALIZATION, MISSING_PUNCTUATION
        - TENSE: PRESENT_SIMPLE, PAST_SIMPLE, PAST_PERFECT, MIXED_TENSE...
        - STRUCTURE: WORD_ORDER, SUBJECT_VERB_AGREEMENT, MISSING_SUBJECT,
                     MISSING_VERB, MISSING_OBJECT, REDUNDANCY, FRAGMENT...
        - WORD_CHOICE: WRONG_WORD, COLLOCATION, SYNONYM_MISUSE
        - MEANING: MISTRANSLATION, WRONG_MEANING, OMISSION, ADDITION
        - ARTICLE: A_AN, THE, ZERO_ARTICLE, A_AN_VS_THE
        - PREPOSITION: TIME_IN, TIME_ON, TIME_AT, PLACE_IN, PLACE_ON...
        - POS: PRONOUN, ADJECTIVE_ADVERB, NOUN_ADJECTIVE, DETERMINER...
        """;

    // ========================================
    // 4B. CORE EVALUATION RULES
    // ========================================
    public static final String CORE_EVALUATION_RULES = """
        
        ═══════════════════════════════════════════════════
        TRIẾT LÝ CHẤM ĐIỂM
        ═══════════════════════════════════════════════════
        
        Bạn đang chấm BÀI DỊCH, KHÔNG PHẢI so khớp với đáp án mẫu.
        "Đáp án mẫu" chỉ là MỘT trong NHIỀU cách dịch đúng.
        
        ─────────────────────────────────────────
        LỖI LÀ GÌ?
        ─────────────────────────────────────────
        LỖI = vi phạm 1 trong các quy tắc:
        - Ngữ pháp: vi phạm cấu trúc câu tiếng Anh chuẩn
        - Từ vựng: dùng từ sai nghĩa/ngữ cảnh
        - Chính tả: viết sai từ
        - Nghĩa: không truyền đạt đúng nghĩa câu gốc
        
        KHÔNG PHẢI LỖI:
        - Cách diễn đạt khác nhưng đúng nghĩa
        - Từ đồng nghĩa (often/usually, big/large)
        - Cấu trúc tương đương (I think = In my opinion)
        - Determiner thay thế nhau (the/this/that store)
        - Phong cách khác (formal/informal đều OK)
        
        ─────────────────────────────────────────
        NGUYÊN TẮC CHỐNG BẮT LỖI OAN
        ─────────────────────────────────────────
        Trước khi thêm 1 error vào mảng, PHẢI trả lời 3 câu hỏi:
        
        1. Nếu người bản xứ đọc câu này, họ có hiểu đúng không?
           → CÓ hiểu → KHÔNG phải lỗi
        
        2. Câu này vi phạm quy tắc ngữ pháp CỨNG nào?
           → KHÔNG vi phạm → KHÔNG phải lỗi
        
        3. Nếu thay ngữ cảnh, câu này có đúng không?
           → CÓ đúng → KHÔNG phải lỗi
        
        Chỉ khi cả 3 đều "KHÔNG" → mới thêm vào errors.
        
        ─────────────────────────────────────────
        QUY TRÌNH SUY RA LABEL
        ─────────────────────────────────────────
        Bước 1: So sánh userText vs correctText → khác chỗ nào?
        Bước 2: Tại sao phải sửa?
           - Viết sai ký tự → SPELLING / TYPO
           - Không viết hoa đầu câu → SPELLING / CAPITALIZATION
           - Thiếu dấu chấm/hỏi cuối → SPELLING / MISSING_PUNCTUATION
           - Sai ngữ pháp → TENSE / STRUCTURE / ARTICLE / PREPOSITION / ...
           - Sai từ vựng → WORD_CHOICE
           - Sai nghĩa → MEANING
        Bước 3: Chọn category/subtype phù hợp
        Bước 4: Kiểm tra explanation có khớp label không?
           - Nếu không khớp → SỬA LẠI
        
        ─────────────────────────────────────────
        BẮT LỖI ĐẦY ĐỦ
        ─────────────────────────────────────────
        Khi phân tích 1 câu, kiểm tra LẦN LƯỢT:
        a) Chính tả từng từ
        b) Viết hoa đầu câu
        c) Dấu câu cuối câu
        d) Chia động từ theo chủ ngữ (SVA)
        e) Thì của động từ
        f) Mạo từ trước danh từ
        g) Giới từ
        h) Trật tự từ
        i) Nghĩa có khớp câu gốc không
        
        Một câu CÓ THỂ có NHIỀU lỗi. KHÔNG bỏ sót.
        """;

    // ========================================
    // 4C. FEW-SHOT EXAMPLES
    // ========================================
    public static final String FEW_SHOT_EXAMPLES = """
        
        ═══════════════════════════════════════════════════
        VÍ DỤ CHẤM ĐÚNG
        ═══════════════════════════════════════════════════
        
        ── Ví dụ 1: Đúng nhưng KHÁC đáp án mẫu ──
        Câu gốc: "Tôi thường ăn sáng lúc 7 giờ"
        Đáp án mẫu: "I usually have breakfast at 7 AM"
        Học viên: "I often have breakfast at 7 o'clock"
        → isCorrect = true, errors = []
        
        ── Ví dụ 2: Determiner khác nhưng vẫn đúng ──
        Câu gốc: "Học sinh thường mua sách ở cửa hàng đó."
        Học viên: "Students often buy books at that store."
        → isCorrect = true, errors = []
        ('that store' và 'the store' đều đúng)
        
        ── Ví dụ 3: SAI chính tả ──
        Học viên: "She offten cooks"
        → errors = [{errorCategory: "SPELLING", errorSubtype: "TYPO",
                     userText: "offten", correctText: "often",
                     explanation: "Từ 'offten' viết sai chính tả."}]
        
        ── Ví dụ 4: SAI hòa hợp chủ - động ──
        Học viên: "She cook every morning"
        → errors = [{errorCategory: "STRUCTURE",
                     errorSubtype: "SUBJECT_VERB_AGREEMENT",
                     userText: "She cook", correctText: "She cooks",
                     explanation: "Chủ ngữ số ít ngôi thứ ba 'She' → động từ thêm 's'."}]
        
        ── Ví dụ 5: "I have a lot of traffic" ──
        Câu gốc: "Tôi gặp rất nhiều giao thông trên đường đi làm."
        Học viên: "I have a lot of traffic on my way to work."
        → errors = [{errorCategory: "WORD_CHOICE", errorSubtype: "WRONG_WORD",
                     userText: "have a lot of traffic", correctText: "encounter a lot of traffic",
                     explanation: "Trong tiếng Anh, 'have traffic' không tự nhiên. Người bản xứ dùng 'encounter' hoặc 'get stuck in'."}]
        (KHÔNG dùng MISSING_VERB — vì "have" LÀ động từ)
        
        ── Ví dụ 6: BẮT NHIỀU LỖI CÙNG LÚC ──
        Học viên: "passeger buy tickets"
        → errors = [
            { errorCategory: "SPELLING", errorSubtype: "TYPO",
              userText: "passeger", correctText: "passenger",
              explanation: "Viết sai chính tả 'passeger' → 'passenger'." },
            { errorCategory: "SPELLING", errorSubtype: "CAPITALIZATION",
              userText: "passeger", correctText: "Passeger",
              explanation: "Đầu câu phải viết hoa." },
            { errorCategory: "STRUCTURE", errorSubtype: "SUBJECT_VERB_AGREEMENT",
              userText: "Passeger buy", correctText: "Passengers buy",
              explanation: "Chủ ngữ số nhiều 'Passengers' → động từ nguyên mẫu 'buy'." }
          ]
        """;

    // ========================================
    // 5. PROMPT TEMPLATES
    // ========================================

    public static final String GENERATE_PROMPT_TEMPLATE = """
        Bạn là giáo viên tiếng Anh 10 năm kinh nghiệm.
        Nhiệm vụ: Tạo câu tiếng Việt để học viên dịch sang tiếng Anh.
        
        ═══════════════════════════════════════════════════
        ⚠️ RÀNG BUỘC BẮT BUỘC
        ═══════════════════════════════════════════════════
        
        📌 TRÌNH ĐỘ: %s
        - Câu PHẢI phù hợp với trình độ (xem hướng dẫn bên dưới)
        - KHÔNG được dùng thì/cấu trúc chưa học ở level này
        - Độ dài câu PHẢI đúng theo level
        
        📌 CHỦ ĐỀ: %s
        - Câu PHẢI liên quan TRỰC TIẾP đến chủ đề này
        - KHÔNG được lạc sang chủ đề khác
        
        📌 LOẠI CÂU: %s
        - PHẢI tuân thủ CHÍNH XÁC loại câu (xem giải thích bên dưới)
        - Nếu là ANSWER → CHỈ câu trần thuật, KHÔNG có "?"
        - Nếu là QUESTION → CHỈ câu hỏi, PHẢI có "?"
        - KHÔNG tự ý thêm loại câu khác xen kẽ
        
        ═══════════════════════════════════════════════════
        HƯỚNG DẪN THEO TRÌNH ĐỘ
        ═══════════════════════════════════════════════════
        %s
        
        ═══════════════════════════════════════════════════
        HƯỚNG DẪN THEO CHỦ ĐỀ
        ═══════════════════════════════════════════════════
        %s
        
        ═══════════════════════════════════════════════════
        LOẠI CÂU BẮT BUỘC: %s
        ═══════════════════════════════════════════════════
        %s
        
        ═══════════════════════════════════════════════════
        ⚠️ TỪ VỰNG BẮT BUỘC TRONG CÂU NÀY
        ═══════════════════════════════════════════════════
        %s
        
        ═══════════════════════════════════════════════════
        CÁC CÂU ĐÃ HỎI TRƯỚC ĐÓ (KHÔNG ĐƯỢC LẶP)
        ═══════════════════════════════════════════════════
        %s
        
        ═══════════════════════════════════════════════════
        QUY TẮC CHỐNG TRÙNG LẶP
        ═══════════════════════════════════════════════════
        1. Câu tiếp theo KHÔNG được giống câu trên
        2. KHÔNG dùng lại CÙNG chủ ngữ + CÙNG động từ + CÙNG trạng ngữ
        3. PHẢI thay đổi ÍT NHẤT 2 yếu tố:
           - Chủ ngữ: I → She / They / My brother...
           - Động từ: eat → cook / buy / enjoy...
           - Trạng ngữ: lúc 7 giờ → ở nhà / hôm qua...
           - Cấu trúc: khẳng định → phủ định
        
        ═══════════════════════════════════════════════════
        CHECKLIST TRƯỚC KHI TRẢ JSON
        ═══════════════════════════════════════════════════
        □ Câu tiếng Việt ĐÚNG loại câu yêu cầu
        □ Nếu là ANSWER: KHÔNG có "?", KHÔNG có từ để hỏi
        □ Nếu là QUESTION: PHẢI có "?", PHẢI có từ để hỏi
        □ Câu liên quan TRỰC TIẾP đến chủ đề
        □ Câu phù hợp với trình độ (độ dài + thì)
        □ Câu KHÔNG trùng với câu đã hỏi
        □ Nếu có từ vựng force: câu PHẢI chứa từ đó
        
        Nếu BẤT KỲ ô nào KHÔNG đạt → SỬA LẠI.
        
        === JSON OUTPUT ===
        {
          "vietnameseSentence": "câu tiếng Việt",
          "expectedAnswer": "câu tiếng Anh đúng",
          "sentenceType": "QUESTION|ANSWER|RANDOM",
          "usedVocabulary": ["từ tiếng Anh đã dùng trong câu"]
        }
        """;

    public static final String EVALUATE_PROMPT_TEMPLATE = """
        Bạn là giáo viên tiếng Anh chuyên đánh giá bài dịch.
        
        === NGỮ CẢNH ===
        - Câu tiếng Việt: %s
        - Bài dịch: %s
        - Đáp án đúng: %s
        - Trình độ: %s
        
        %s
        
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
          "errors": [...]
        }
        """;

    public static final String EVALUATE_AND_GENERATE_PROMPT_TEMPLATE = """
        Bạn là giáo viên tiếng Anh chuyên đánh giá bài dịch và tạo câu tiếp theo.
        
        ⚠️ QUY TẮC BẮT BUỘC:
        1. TẤT CẢ feedback, explanation PHẢI bằng TIẾNG VIỆT
        2. CHỈ expectedAnswer, correctText, userText, betterAnswers là TIẾNG ANH
        3. PHẢI phân tích TỪNG LỖI riêng biệt
        4. Mỗi lỗi PHẢI có đủ 7 thành phần
        5. Chỉ trả về JSON
        
        ═══════════════════════════════════════════════════
        PHẦN 1: ĐÁNH GIÁ BÀI DỊCH
        ═══════════════════════════════════════════════════
        
        === NGỮ CẢNH ĐÁNH GIÁ ===
        - Câu tiếng Việt: %s
        - Bài dịch của học viên: %s
        - Đáp án đúng: %s
        - Trình độ: %s
        - Chủ đề: %s
        
        === TRIẾT LÝ CHẤM ===
        %s
        
        === VÍ DỤ ===
        %s
        
        ═══════════════════════════════════════════════════
        PHẦN 2: TẠO CÂU TIẾP THEO
        ═══════════════════════════════════════════════════
        
        📌 TRÌNH ĐỘ: %s
        - Câu tiếp theo PHẢI phù hợp với level này
        - KHÔNG dùng thì/cấu trúc chưa học ở level
        
        📌 CHỦ ĐỀ: %s
        - Câu tiếp theo PHẢI liên quan TRỰC TIẾP đến chủ đề
        
        📌 LOẠI CÂU BẮT BUỘC: %s
        %s
        
        ⚠️ NHẮC LẠI: KHÔNG được sinh loại câu khác.
        
        📌 HƯỚNG DẪN TRÌNH ĐỘ:
        %s
        
        📌 HƯỚNG DẪN CHỦ ĐỀ:
        %s
        
        ═══════════════════════════════════════════════════
        ⚠️ TỪ VỰNG BẮT BUỘC TRONG CÂU TIẾP THEO
        ═══════════════════════════════════════════════════
        %s
        
        ═══════════════════════════════════════════════════
        CÁC CÂU ĐÃ HỎI TRƯỚC ĐÓ (KHÔNG LẶP)
        ═══════════════════════════════════════════════════
        %s
        
        ═══════════════════════════════════════════════════
        QUY TẮC CHỐNG TRÙNG LẶP
        ═══════════════════════════════════════════════════
        1. Câu tiếp theo KHÔNG được giống câu trên
        2. PHẢI thay đổi ÍT NHẤT 2 yếu tố
        
        ═══════════════════════════════════════════════════
        ERROR TAXONOMY
        ═══════════════════════════════════════════════════
        %s
        
        ═══════════════════════════════════════════════════
        ĐỊNH DẠNG JSON
        ═══════════════════════════════════════════════════
        {
          "isCorrect": boolean,
          "score": number (0-100),
          "naturalnessScore": number (0-100),
          "feedback": "string (TIẾNG VIỆT)",
          "betterAnswers": ["câu tiếng Anh hay hơn"],
          "errors": [
            {
              "errorType": "...",
              "errorCategory": "...",
              "errorSubtype": "...",
              "userText": "...",
              "correctText": "...",
              "explanation": "...",
              "severity": "HIGH|MEDIUM|LOW"
            }
          ],
          "nextQuestion": {
            "vietnameseSentence": "câu tiếp theo",
            "expectedAnswer": "đáp án",
            "sentenceType": "QUESTION|ANSWER|RANDOM",
            "usedVocabulary": ["từ đã dùng"]
          }
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
        for (int i = 0; i < previousSentences.size(); i++) {
            sb.append(i + 1).append(". ").append(previousSentences.get(i)).append("\n");
        }
        return sb.toString();
    }

    /**
     * ✅ Format block forced words (1-2 từ).
     * Rỗng = AI tự do.
     */
    private static String formatForcedWordsBlock(List<String> forcedWords) {
        if (forcedWords == null || forcedWords.isEmpty()) {
            return "✓ Không có từ vựng bắt buộc. Câu tiếp theo có thể dùng BẤT KỲ từ nào.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Câu tiếp theo BẮT BUỘC PHẢI chứa ").append(forcedWords.size()).append(" từ vựng sau:\n\n");
        for (int i = 0; i < forcedWords.size(); i++) {
            sb.append(i + 1).append(". \"").append(forcedWords.get(i)).append("\"\n");
        }
        sb.append("\nYÊU CẦU:\n");
        sb.append("- Câu tiếng Việt PHẢI chứa từ/cụm từ mang nghĩa của TẤT CẢ các từ trên\n");
        sb.append("  VD: \"coffee\" → \"cà phê\", \"morning\" → \"buổi sáng\"\n");
        sb.append("- Đáp án tiếng Anh PHẢI chứa TẤT CẢ các từ trên\n");
        sb.append("- PHẢI trả về usedVocabulary chứa TẤT CẢ các từ trên\n");
        sb.append("- KHÔNG được dùng thêm từ vựng khác trong danh sách user nạp\n");
        sb.append("- Đây là yêu cầu CỨNG.\n");

        return sb.toString();
    }

    // ========================================
    // 7. FORMAT METHODS
    // ========================================

    public static String formatGeneratePrompt(
            String level, String topic, String sentenceType,
            String weaknesses, List<String> previousSentences,
            List<String> forcedWords) {

        String normalizedType = (sentenceType != null && !sentenceType.isEmpty())
                ? sentenceType.toUpperCase()
                : "RANDOM";

        return String.format(
                GENERATE_PROMPT_TEMPLATE,
                level,                                              // %s 1 - Trình độ
                topic,                                              // %s 2 - Chủ đề
                normalizedType,                                     // %s 3 - Loại câu
                getLevelDescription(level),                         // %s 4 - Hướng dẫn trình độ
                getTopicDescription(topic),                         // %s 5 - Hướng dẫn chủ đề
                normalizedType,                                     // %s 6 - Loại câu (lặp)
                getSentenceTypeDescription(normalizedType),         // %s 7 - Mô tả chi tiết loại câu
                formatForcedWordsBlock(forcedWords),                // %s 8 - Từ vựng force
                formatPreviousSentences(previousSentences)          // %s 9 - Câu đã hỏi
        );
    }

    public static String formatEvaluateAndGeneratePrompt(
            String vietnameseSentence, String studentAnswer,
            String expectedAnswer, String level, String topic,
            String weaknesses, String sentenceType,
            List<String> previousSentences, List<String> forcedWords) {

        String normalizedType = (sentenceType != null && !sentenceType.isEmpty())
                ? sentenceType.toUpperCase()
                : "RANDOM";

        return String.format(
                EVALUATE_AND_GENERATE_PROMPT_TEMPLATE,
                vietnameseSentence,                                 // %s 1
                studentAnswer,                                      // %s 2
                expectedAnswer,                                     // %s 3
                level,                                              // %s 4
                topic,                                              // %s 5
                CORE_EVALUATION_RULES,                              // %s 6
                FEW_SHOT_EXAMPLES,                                  // %s 7
                level,                                              // %s 8 - Trình độ câu tiếp
                topic,                                              // %s 9 - Chủ đề câu tiếp
                normalizedType,                                     // %s 10 - Loại câu
                getSentenceTypeDescription(normalizedType),         // %s 11 - Mô tả loại câu
                getLevelDescription(level),                         // %s 12
                getTopicDescription(topic),                         // %s 13
                formatForcedWordsBlock(forcedWords),                // %s 14 - Từ vựng force
                formatPreviousSentences(previousSentences),         // %s 15 - Câu đã hỏi
                ERROR_TAXONOMY                                      // %s 16
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
                CORE_EVALUATION_RULES,
                getLevelDescription(level),
                ERROR_TAXONOMY
        );
    }
}