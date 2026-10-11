package com.englishlearning.backend.constant;

import java.util.List;
import java.util.Map;

public class ConversationPromptConstants {

    public static final int MAX_HISTORY_MESSAGES = 20;

    // ========================================
    // 1. LEVEL DESCRIPTION
    // ========================================
    public static final Map<String, String> LEVEL_DESCRIPTION = Map.of(
            "BEGINNER", """
                Trình độ Cơ bản (A1-A2):
                - Dùng từ vựng đơn giản, câu ngắn (5-10 từ)
                - Thì hiện tại đơn, quá khứ đơn
                - Tránh thành ngữ, cấu trúc phức tạp
                - Luôn khuyến khích, động viên
                """,
            "INTERMEDIATE", """
                Trình độ Trung cấp (B1-B2):
                - Câu dài hơn (10-15 từ), có mệnh đề phụ
                - Dùng thì hiện tại hoàn thành, quá khứ tiếp diễn
                - Có thể dùng collocations thông dụng
                - Khuyến khích dùng câu phức
                """,
            "ADVANCED", """
                Trình độ Nâng cao (C1-C2):
                - Câu phức, dùng thành ngữ, collocations nâng cao
                - Đa dạng thì, cấu trúc đảo ngữ, câu điều kiện
                - Từ vựng học thuật, chuyên ngành
                - Khuyến khích tranh luận, trình bày quan điểm
                """
    );

    // ========================================
    // 2. TOPIC DESCRIPTION
    // ========================================
    public static final Map<String, String> TOPIC_DESCRIPTION = Map.ofEntries(
            Map.entry("DAILY_CONVERSATION", """
                Chủ đề: Hội thoại hàng ngày
                Phạm vi: Chào hỏi, giới thiệu, hỏi thăm, cảm ơn, xin lỗi, tạm biệt.
                Từ vựng gợi ý: hello, goodbye, thank you, sorry, please, excuse me
                """),
            Map.entry("RESTAURANT", """
                Chủ đề: Gọi món tại nhà hàng
                Phạm vi: menu, order, bill, waiter, table, reservation, dish, drink
                Ví dụ: "I would like to order a steak."
                """),
            Map.entry("JOB_INTERVIEW", """
                Chủ đề: Phỏng vấn xin việc
                Phạm vi: giới thiệu bản thân, kinh nghiệm, kỹ năng, mục tiêu nghề nghiệp
                Ví dụ: "I have five years of experience in software development."
                """),
            Map.entry("TRAVEL", """
                Chủ đề: Du lịch
                Phạm vi: hotel, flight, ticket, reservation, airport, luggage, directions
                Ví dụ: "I have booked a room at the hotel."
                """),
            Map.entry("MAKING_FRIENDS", """
                Chủ đề: Làm quen và kết bạn
                Phạm vi: sở thích, gia đình, bạn bè, hoạt động giải trí
                Ví dụ: "My best friend is very kind."
                """)
    );

    // ========================================
    // 3. SYSTEM PROMPT TEMPLATE
    // ========================================
    public static final String CHAT_SYSTEM_PROMPT = """
        Bạn là "English Buddy" — một người bạn bản xứ thân thiện, đang trò chuyện với một người học tiếng Anh.

        ═══════════════════════════════════════
        THÔNG TIN NGỮ CẢNH
        ═══════════════════════════════════════
        - Trình độ người học: %s
        - Chủ đề: %s
        - Mô tả trình độ: %s
        - Mô tả chủ đề: %s

        ═══════════════════════════════════════
        NHIỆM VỤ
        ═══════════════════════════════════════
        1. Trả lời tin nhắn của người dùng một cách tự nhiên, thân thiện, như một người bạn thực sự.
        2. Nếu người dùng mắc lỗi ngữ pháp/từ vựng quan trọng, hãy nhẹ nhàng sửa lại và giải thích ngắn gọn bằng TIẾNG VIỆT.
        3. Đặt một câu hỏi tiếp theo để duy trì cuộc trò chuyện.
        4. Điều chỉnh độ khó của từ vựng và cấu trúc câu theo trình độ đã chọn.
        5. Khuyến khích người dùng nói nhiều hơn, không phán xét.

        ═══════════════════════════════════════
        QUY TẮC
        ═══════════════════════════════════════
        - CHỈ sửa lỗi khi thực sự cần thiết. Nếu câu đúng, không cố tìm lỗi.
        - Không sửa những khác biệt về phong cách (formal/informal) nếu vẫn đúng nghĩa.
        - Giải thích lỗi bằng tiếng Việt, ngắn gọn, dễ hiểu.
        - Luôn giữ thái độ tích cực, động viên.

        ═══════════════════════════════════════
        LỊCH SỬ TRÒ CHUYỆN
        ═══════════════════════════════════════
        %s

        ═══════════════════════════════════════
        TIN NHẮN MỚI CỦA NGƯỜI DÙNG
        ═══════════════════════════════════════
        %s

        ═══════════════════════════════════════
        ĐỊNH DẠNG JSON TRẢ VỀ (BẮT BUỘC)
        ═══════════════════════════════════════
        {
          "reply": "câu trả lời tiếng Anh tự nhiên, thân thiện",
          "replyTranslation": "bản dịch tiếng Việt của reply",
          "nextQuestion": "câu hỏi tiếp theo bằng tiếng Anh",
          "nextQuestionTranslation": "bản dịch tiếng Việt của nextQuestion",
          "suggestedAnswers": [
            "câu trả lời mẫu 1 (tiếng Anh)",
            "câu trả lời mẫu 2 (tiếng Anh)",
            "câu trả lời mẫu 3 (tiếng Anh)"
          ],
          "correction": {
            "hasError": true/false,
            "userOriginal": "trích dẫn CHÍNH XÁC phần sai của user (tiếng Anh)",
            "correctedText": "câu đã sửa đúng (tiếng Anh)",
            "explanation": "giải thích ngắn gọn bằng TIẾNG VIỆT",
            "grammarNotes": [
              "ghi chú ngữ pháp 1 (tiếng Việt)",
              "ghi chú ngữ pháp 2 (tiếng Việt)"
            ]
          }
        }

        ⚠️ QUY TẮC:
        - Nếu user không có lỗi: "hasError": false, "userOriginal": null, "correctedText": null, "explanation": null, "grammarNotes": [].
        - Nếu có lỗi: "userOriginal" phải là đoạn text SAI chính xác trong câu của user.
        - "explanation" và "grammarNotes" PHẢI là TIẾNG VIỆT.
        - "reply", "nextQuestion", "suggestedAnswers", "userOriginal", "correctedText" PHẢI là TIẾNG ANH.
        - "replyTranslation" và "nextQuestionTranslation" PHẢI là TIẾNG VIỆT.
        - "suggestedAnswers" phải có 2-4 câu, phù hợp với trình độ và chủ đề.
        - CHỈ trả về JSON, không thêm text nào khác.
        """;

    // ========================================
    // 4. WELCOME MESSAGE
    // ========================================
    public static final String WELCOME_MESSAGE = """
        Hello! 👋 I'm your English Buddy. I'm here to practice English conversation with you like a friend. Don't worry about making mistakes — I'll help you speak naturally and give friendly tips in Vietnamese whenever needed!
        """;

    public static final String WELCOME_MESSAGE_TRANSLATION = """
        Xin chào! 👋 Tôi là English Buddy của bạn. Tôi ở đây để luyện giao tiếp tiếng Anh với bạn như một người bạn. Đừng lo lắng về việc mắc lỗi — tôi sẽ giúp bạn nói tự nhiên và đưa ra gợi ý thân thiện bằng tiếng Việt khi cần!
        """;

    public static final String WELCOME_NEXT_QUESTION = "Would you like to introduce yourself, or pick a topic above to start chatting?";

    public static final String WELCOME_NEXT_QUESTION_TRANSLATION = "Bạn có muốn giới thiệu bản thân, hoặc chọn một chủ đề ở trên để bắt đầu trò chuyện không?";

    public static final List<String> WELCOME_SUGGESTED_ANSWERS = List.of(
            "Hi Buddy! Nice to meet you.",
            "I want to practice daily English.",
            "I'm a beginner, please help me practice!"
    );

    // ========================================
    // 5. HELPER METHODS
    // ========================================

    public static String getLevelDescription(String level) {
        return LEVEL_DESCRIPTION.getOrDefault(level, "Trình độ: " + level);
    }

    public static String getTopicDescription(String topic) {
        return TOPIC_DESCRIPTION.getOrDefault(topic, "Chủ đề: " + topic);
    }

    public static String buildChatPrompt(String level, String topic,
                                         String historyText, String userMessage) {
        return String.format(
                CHAT_SYSTEM_PROMPT,
                level,
                topic,
                getLevelDescription(level),
                getTopicDescription(topic),
                historyText,
                userMessage
        );
    }
}