package com.englishlearning.backend.service.impl.AI;

import com.englishlearning.backend.dto.request.AIEvaluateRequest;
import com.englishlearning.backend.dto.request.AIGenerateRequest;
import com.englishlearning.backend.dto.request.gemini.GeminiContent;
import com.englishlearning.backend.dto.request.gemini.GeminiPart;
import com.englishlearning.backend.dto.request.gemini.GeminiRequest;
import com.englishlearning.backend.dto.request.gemini.GenerationConfig;
import com.englishlearning.backend.dto.response.AIEvaluateResponse;
import com.englishlearning.backend.dto.response.AIGenerateResponse;
import com.englishlearning.backend.dto.response.AIErrorResponse;
import com.englishlearning.backend.dto.response.gemini.GeminiResponse;
import com.englishlearning.backend.dto.response.gemini.GeminiUsageMetadata;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ErrorCode;
import com.englishlearning.backend.service.AI.AIService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class GeminiAIService implements AIService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String geminiApiUrl;

    public GeminiAIService(RestTemplate restTemplate,
                           ObjectMapper objectMapper,
                           @Qualifier("geminiApiUrl") String geminiApiUrl) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.geminiApiUrl = geminiApiUrl;
    }

    @Override
    public AIGenerateResponse generateSentence(AIGenerateRequest request) {
        log.info("Đang tạo câu cho level: {}, topic: {}", request.getLevel(), request.getTopic());

        try {
            String prompt = buildGeneratePrompt(request);
//            String response = callGemini(prompt);
            String response = callGeminiWithRetry(prompt, 3);
            return parseGenerateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi tạo câu: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    @Override
    public AIEvaluateResponse evaluateAnswer(AIEvaluateRequest request) {
        log.info("Đang đánh giá câu trả lời: {}", request.getVietnameseSentence());

        try {
            String prompt = buildEvaluatePrompt(request);
           // String response = callGemini(prompt);
            String response = callGeminiWithRetry(prompt, 3);
            return parseEvaluateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi đánh giá câu trả lời: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    @Override
    public AIEvaluateResponse evaluateAndGenerate(AIEvaluateRequest request) {
        log.info("Đang đánh giá và tạo câu hỏi tiếp theo");

        try {
            String prompt = buildEvaluateAndGeneratePrompt(request);
           // String response = callGemini(prompt);
            String response = callGeminiWithRetry(prompt, 3);
            return parseEvaluateAndGenerateResponse(response);
        } catch (Exception e) {
            log.error("Lỗi đánh giá và tạo câu tiếp theo: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    // ===== PRIVATE METHODS =====

    private String callGemini(String prompt) {
        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(
                        GeminiContent.builder()
                                .parts(List.of(
                                        GeminiPart.builder()
                                                .text(prompt)
                                                .build()
                                ))
                                .role("user")
                                .build()
                ))
                .generationConfig(GenerationConfig.builder()
                        .temperature(0.1)  // ✅ GIẢM TEMPERATURE ĐỂ OUTPUT ỔN ĐỊNH
                        .maxOutputTokens(4096)
                        .responseMimeType("application/json")
                        .build())
                .build();

        try {
            GeminiResponse response = restTemplate.postForObject(geminiApiUrl, request, GeminiResponse.class);

            if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
                log.error("Gemini response is null or empty");
                throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
            }

            String text = response.getCandidates().get(0).getContent().getParts().get(0).getText();

            GeminiUsageMetadata usage = response.getUsageMetadata();
            if (usage != null) {
                log.info("Gemini tokens - Input: {}, Output: {}, Total: {}",
                        usage.getPromptTokenCount(),
                        usage.getCandidatesTokenCount(),
                        usage.getTotalTokenCount());
            }

            return text;
        } catch (Exception e) {
            log.error("Lỗi gọi Gemini API: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR);
        }
    }


    private String buildGeneratePrompt(AIGenerateRequest request) {
        StringBuilder prompt = new StringBuilder();

        // ========== PHẦN 1: VAI TRÒ VÀ NHIỆM VỤ ==========
        prompt.append("Bạn là một giáo viên tiếng Anh chuyên nghiệp với 10 năm kinh nghiệm giảng dạy. ");
        prompt.append("Nhiệm vụ của bạn là tạo ra một câu tiếng Việt để học viên dịch sang tiếng Anh.\n\n");

        // ========== PHẦN 2: QUY TẮC BẮT BUỘC ==========
        prompt.append("=== QUY TẮC BẮT BUỘC ===\n");
        prompt.append("1. Câu tiếng Việt PHẢI ở trình độ phù hợp với level của học viên\n");
        prompt.append("2. Câu tiếng Việt PHẢI liên quan đến topic đã chọn\n");
        prompt.append("3. Câu tiếng Việt PHẢI sử dụng các từ vựng đã chỉ định (nếu có)\n");
        prompt.append("4. Câu tiếng Việt PHẢI có độ dài vừa phải (10-20 từ)\n");
        prompt.append("5. Câu tiếng Việt PHẢI là câu hoàn chỉnh, có nghĩa\n");
        prompt.append("6. Đáp án tiếng Anh PHẢI chính xác về ngữ pháp và từ vựng\n");
        prompt.append("7. Đáp án tiếng Anh PHẢI tự nhiên, sử dụng cấu trúc thông dụng\n");
        prompt.append("8. Chỉ trả về JSON, KHÔNG có bất kỳ văn bản nào khác\n\n");

        // ========== PHẦN 3: THÔNG TIN ĐẦU VÀO ==========
        prompt.append("=== THÔNG TIN ĐẦU VÀO ===\n");
        prompt.append("- Trình độ học viên: ").append(request.getLevel()).append("\n");
        prompt.append("- Loại câu: ").append(request.getSentenceType()).append("\n");
        prompt.append("- Chủ đề: ").append(request.getTopic()).append("\n");

        if (request.getVocabularyWords() != null && !request.getVocabularyWords().isEmpty()) {
            prompt.append("- Từ vựng bắt buộc: ").append(String.join(", ", request.getVocabularyWords())).append("\n");
        }

        if (request.getWeaknesses() != null && !request.getWeaknesses().isEmpty()) {
            prompt.append("- Điểm yếu của học viên: ").append(String.join(", ", request.getWeaknesses())).append("\n");
        }
        prompt.append("\n");

        // ========== PHẦN 4: HƯỚNG DẪN THEO LEVEL ==========
        prompt.append("=== HƯỚNG DẪN THEO TRÌNH ĐỘ ===\n");
        prompt.append("A1: Sử dụng thì hiện tại đơn, câu đơn giản, từ vựng cơ bản (dưới 8 từ)\n");
        prompt.append("A2: Sử dụng thì hiện tại tiếp diễn, quá khứ đơn, câu ghép đơn giản (8-12 từ)\n");
        prompt.append("B1: Sử dụng thì hiện tại hoàn thành, câu điều kiện loại 1, câu phức (12-15 từ)\n");
        prompt.append("B2: Sử dụng các thì phức tạp hơn, câu bị động, câu điều kiện loại 2 (15-18 từ)\n");
        prompt.append("C1: Sử dụng cấu trúc nâng cao, đảo ngữ, câu điều kiện hỗn hợp (18-20 từ)\n");
        prompt.append("C2: Sử dụng ngôn ngữ học thuật, thành ngữ, cấu trúc phức tạp (20-25 từ)\n\n");

        // ========== PHẦN 5: HƯỚNG DẪN THEO TOPIC ==========
        prompt.append("=== HƯỚNG DẪN THEO CHỦ ĐỀ ===\n");
        prompt.append("Family: Gia đình, các thành viên, hoạt động gia đình\n");
        prompt.append("Work: Công việc, nghề nghiệp, văn phòng\n");
        prompt.append("Travel: Du lịch, đặt phòng, di chuyển\n");
        prompt.append("Shopping: Mua sắm, giá cả, siêu thị\n");
        prompt.append("Food: Đồ ăn, nhà hàng, nấu ăn\n");
        prompt.append("Health: Sức khỏe, bệnh viện, tập thể dục\n");
        prompt.append("Education: Học tập, trường học, thi cử\n");
        prompt.append("Technology: Công nghệ, điện thoại, máy tính\n");
        prompt.append("Hobbies: Sở thích, giải trí, thể thao\n");
        prompt.append("Daily Routine: Thói quen hàng ngày\n\n");

        // ========== PHẦN 6: ĐỊNH DẠNG JSON ==========
        prompt.append("=== ĐỊNH DẠNG JSON ===\n");
        prompt.append("Trả về JSON theo cấu trúc sau (KHÔNG có text khác):\n");
        prompt.append("{\n");
        prompt.append("  \"vietnameseSentence\": \"câu tiếng Việt\",\n");
        prompt.append("  \"expectedAnswer\": \"câu tiếng Anh đúng\",\n");
        prompt.append("  \"sentenceType\": \"QUESTION\"\n");
        prompt.append("}\n\n");

        // ========== PHẦN 7: VÍ DỤ ==========
        prompt.append("=== VÍ DỤ ===\n");
        prompt.append("Đầu vào: level=A2, topic=Travel, vocabulary=hotel,book\n");
        prompt.append("Đầu ra: {\n");
        prompt.append("  \"vietnameseSentence\": \"Tôi đã đặt một phòng tại khách sạn gần sân bay.\",\n");
        prompt.append("  \"expectedAnswer\": \"I have booked a room at the hotel near the airport.\",\n");
        prompt.append("  \"sentenceType\": \"ANSWER\"\n");
        prompt.append("}\n\n");

        prompt.append("Lưu ý: Tuyệt đối không thêm bất kỳ text nào ngoài JSON.");

        return prompt.toString();
    }
    private String buildEvaluatePrompt(AIEvaluateRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Bạn là giáo viên tiếng Anh chuyên đánh giá bài dịch. ");
        prompt.append("Nhiệm vụ: Đánh giá câu trả lời của học viên.\n\n");

        prompt.append("=== QUY TẮC BẮT BUỘC ===\n");
        prompt.append("1. TẤT CẢ feedback, explanation PHẢI bằng TIẾNG VIỆT\n");
        prompt.append("2. CHỈ expectedAnswer và correctText được phép là TIẾNG ANH\n");
        prompt.append("3. Phân tích lỗi PHẢI chi tiết, cụ thể\n");
        prompt.append("4. Chỉ trả về JSON, KHÔNG có bất kỳ văn bản nào khác\n\n");

        prompt.append("=== NGỮ CẢNH ===\n");
        prompt.append("- Câu tiếng Việt: ").append(request.getVietnameseSentence()).append("\n");
        prompt.append("- Bài dịch: ").append(request.getStudentAnswer()).append("\n");
        prompt.append("- Đáp án đúng: ").append(request.getExpectedAnswer()).append("\n");
        prompt.append("- Trình độ: ").append(request.getLevel()).append("\n\n");

        // ✅ THÊM HƯỚNG DẪN CHẤM ĐIỂM
        prompt.append("=== HƯỚNG DẪN CHẤM ĐIỂM ===\n");
        prompt.append("1. Đúng hoàn toàn: 95-100 điểm\n");
        prompt.append("2. Đúng nhưng có lỗi nhỏ: 85-94 điểm\n");
        prompt.append("3. Đúng ý nhưng sai ngữ pháp nhẹ: 70-84 điểm\n");
        prompt.append("4. Đúng ý nhưng sai ngữ pháp nặng: 50-69 điểm\n");
        prompt.append("5. Sai ý chính: 30-49 điểm\n");
        prompt.append("6. Không liên quan: 0-29 điểm\n\n");

        // ✅ THÊM CÁC LOẠI LỖI
        prompt.append("=== CÁC LOẠI LỖI ===\n");
        prompt.append("GRAMMAR|TENSE|PREPOSITION|WORD_ORDER|WORD_CHOICE|VOCABULARY|SPELLING|NATURALNESS|MISSING_WORD|EXTRA_WORD\n\n");

        prompt.append("=== ĐỊNH DẠNG JSON ===\n");
        prompt.append("{\n");
        prompt.append("  \"isCorrect\": boolean,\n");
        prompt.append("  \"score\": number,\n");
        prompt.append("  \"naturalnessScore\": number,\n");
        prompt.append("  \"feedback\": \"string (TIẾNG VIỆT)\",\n");
        prompt.append("  \"betterAnswers\": [\"string\"],\n");
        prompt.append("  \"errors\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"errorType\": \"GRAMMAR|TENSE|PREPOSITION|WORD_ORDER|WORD_CHOICE|VOCABULARY|SPELLING|NATURALNESS|MISSING_WORD|EXTRA_WORD\",\n");
        prompt.append("      \"userText\": \"phần sai\",\n");
        prompt.append("      \"correctText\": \"phần đúng (TIẾNG ANH)\",\n");
        prompt.append("      \"explanation\": \"giải thích (TIẾNG VIỆT)\",\n");
        prompt.append("      \"severity\": \"HIGH|MEDIUM|LOW\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n\n");

        prompt.append("Lưu ý: Tuyệt đối không thêm bất kỳ text nào ngoài JSON.");

        return prompt.toString();
    }


    private String buildEvaluateAndGeneratePrompt(AIEvaluateRequest request) {
        StringBuilder prompt = new StringBuilder();

        // ========== PHẦN 1: VAI TRÒ ==========
        prompt.append("Bạn là giáo viên tiếng Anh chuyên đánh giá bài dịch. ");
        prompt.append("Nhiệm vụ: Đánh giá câu trả lời của học viên và tạo câu hỏi tiếp theo.\n\n");

        // ========== PHẦN 2: QUY TẮC BẮT BUỘC ==========
        prompt.append("=== QUY TẮC BẮT BUỘC TUYỆT ĐỐI ===\n");
        prompt.append("1. TẤT CẢ feedback, explanation, description PHẢI bằng TIẾNG VIỆT\n");
        prompt.append("2. CHỈ expectedAnswer và correctText được phép là TIẾNG ANH\n");
        prompt.append("3. KHÔNG được sử dụng TIẾNG ANH trong bất kỳ phần giải thích nào\n");
        prompt.append("4. Phân tích lỗi PHẢI chi tiết, cụ thể, dễ hiểu\n");
        prompt.append("5. Điểm số PHẢI công bằng, phản ánh đúng chất lượng bài dịch\n");
        prompt.append("6. Câu tiếp theo PHẢI phù hợp với trình độ và điểm yếu của học viên\n");
        prompt.append("7. Chỉ trả về JSON, KHÔNG có bất kỳ văn bản nào khác\n\n");

        // ========== PHẦN 3: NGỮ CẢNH ĐÁNH GIÁ ==========
        prompt.append("=== NGỮ CẢNH ĐÁNH GIÁ ===\n");
        prompt.append("- Câu tiếng Việt: ").append(request.getVietnameseSentence()).append("\n");
        prompt.append("- Bài dịch của học viên: ").append(request.getStudentAnswer()).append("\n");
        prompt.append("- Đáp án đúng: ").append(request.getExpectedAnswer()).append("\n");
        prompt.append("- Trình độ: ").append(request.getLevel()).append("\n");
        prompt.append("- Chủ đề: ").append(request.getTopic()).append("\n");

        if (request.getVocabularyWords() != null && !request.getVocabularyWords().isEmpty()) {
            prompt.append("- Từ vựng yêu cầu: ").append(String.join(", ", request.getVocabularyWords())).append("\n");
        }

        if (request.getWeaknesses() != null && !request.getWeaknesses().isEmpty()) {
            prompt.append("- Điểm yếu cần tập trung: ").append(String.join(", ", request.getWeaknesses())).append("\n");
        }
        prompt.append("\n");

        // ========== PHẦN 4: HƯỚNG DẪN CHẤM ĐIỂM ==========
        prompt.append("=== HƯỚNG DẪN CHẤM ĐIỂM CHI TIẾT ===\n");
        prompt.append("1. Đúng hoàn toàn, tự nhiên: 95-100 điểm\n");
        prompt.append("2. Đúng, tự nhiên nhưng có lỗi nhỏ không ảnh hưởng nghĩa: 85-94 điểm\n");
        prompt.append("3. Đúng ý nhưng sai ngữ pháp nhẹ: 70-84 điểm\n");
        prompt.append("4. Đúng ý nhưng sai ngữ pháp nặng: 50-69 điểm\n");
        prompt.append("5. Sai ý chính, hiểu sai nghĩa: 30-49 điểm\n");
        prompt.append("6. Trả lời không liên quan hoặc bỏ trống: 0-29 điểm\n\n");

        // ========== PHẦN 5: CÁC LOẠI LỖI ==========
        prompt.append("=== CÁC LOẠI LỖI VÀ CÁCH XỬ LÝ ===\n");
        prompt.append("1. GRAMMAR: Sai cấu trúc ngữ pháp\n");
        prompt.append("   - Trừ 5-20 điểm tùy mức độ\n");
        prompt.append("   - Ví dụ: 'I go to school yesterday' -> 'I went to school yesterday'\n\n");
        prompt.append("2. TENSE: Sai thì\n");
        prompt.append("   - Trừ 5-15 điểm\n");
        prompt.append("   - Ví dụ: 'I have been' -> 'I had been'\n\n");
        prompt.append("3. PREPOSITION: Sai giới từ\n");
        prompt.append("   - Trừ 3-10 điểm\n");
        prompt.append("   - Ví dụ: 'in the table' -> 'on the table'\n\n");
        prompt.append("4. WORD_ORDER: Sai trật tự từ\n");
        prompt.append("   - Trừ 3-10 điểm\n");
        prompt.append("   - Ví dụ: 'I always am' -> 'I am always'\n\n");
        prompt.append("5. WORD_CHOICE: Dùng từ không tự nhiên trong ngữ cảnh\n");
        prompt.append("   - Trừ 3-8 điểm\n");
        prompt.append("   - Ví dụ: 'fruit counter' -> 'fruit section'\n\n");
        prompt.append("6. VOCABULARY: Dùng từ sai nghĩa\n");
        prompt.append("   - Trừ 10-25 điểm\n");
        prompt.append("   - Ví dụ: 'I drink an apple' -> 'I eat an apple'\n\n");
        prompt.append("7. SPELLING: Sai chính tả\n");
        prompt.append("   - Trừ 2-5 điểm mỗi lỗi\n");
        prompt.append("   - Ví dụ: 'accommodation' -> 'accomodation'\n\n");
        prompt.append("8. NATURALNESS: Câu đúng ngữ pháp nhưng không tự nhiên\n");
        prompt.append("   - Trừ 3-10 điểm\n");
        prompt.append("   - Ví dụ: 'I am having a book' -> 'I have a book'\n\n");
        prompt.append("9. MISSING_WORD: Thiếu từ\n");
        prompt.append("   - Trừ 5-10 điểm\n");
        prompt.append("   - Ví dụ: 'I go school' -> 'I go to school'\n\n");
        prompt.append("10. EXTRA_WORD: Thừa từ\n");
        prompt.append("    - Trừ 3-8 điểm\n");
        prompt.append("    - Ví dụ: 'I am go to school' -> 'I go to school'\n\n");

        // ========== PHẦN 6: SEVERITY ==========
        prompt.append("=== MỨC ĐỘ NGHIÊM TRỌNG ===\n");
        prompt.append("HIGH: Lỗi làm thay đổi nghĩa của câu\n");
        prompt.append("MEDIUM: Lỗi ảnh hưởng đến độ tự nhiên nhưng không làm thay đổi nghĩa\n");
        prompt.append("LOW: Lỗi nhỏ, không ảnh hưởng đến nghĩa\n\n");

        // ========== PHẦN 7: TẠO CÂU TIẾP THEO ==========
        prompt.append("=== HƯỚNG DẪN TẠO CÂU TIẾP THEO ===\n");
        prompt.append("1. Nếu học viên làm đúng: tăng độ khó nhẹ\n");
        prompt.append("2. Nếu học viên làm sai: tạo câu đơn giản hơn, tập trung vào lỗi sai\n");
        prompt.append("3. Luôn sử dụng từ vựng đã chỉ định (nếu có)\n");
        prompt.append("4. Câu tiếp theo PHẢI khác hoàn toàn với câu trước\n");
        prompt.append("5. Độ dài câu phù hợp với level\n");
        prompt.append("6. Nếu học viên có điểm yếu: ưu tiên tạo câu sửa lỗi đó\n\n");

        // ========== PHẦN 8: ĐỊNH DẠNG JSON ==========
        prompt.append("=== ĐỊNH DẠNG JSON ===\n");
        prompt.append("Trả về JSON theo cấu trúc sau (KHÔNG có text khác):\n");
        prompt.append("{\n");
        prompt.append("  \"isCorrect\": boolean (true nếu điểm >= 70),\n");
        prompt.append("  \"score\": number (0-100),\n");
        prompt.append("  \"naturalnessScore\": number (0-100),\n");
        prompt.append("  \"feedback\": \"string (TIẾNG VIỆT - giải thích chi tiết, gợi ý cách sửa)\",\n");
        prompt.append("  \"betterAnswers\": [\"câu tiếng Anh hay hơn\"],\n");
        prompt.append("  \"errors\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"errorType\": \"GRAMMAR|TENSE|PREPOSITION|WORD_ORDER|WORD_CHOICE|VOCABULARY|SPELLING|NATURALNESS|MISSING_WORD|EXTRA_WORD\",\n");
        prompt.append("      \"userText\": \"phần sai (trích từ bài của học viên)\",\n");
        prompt.append("      \"correctText\": \"phần đúng (TIẾNG ANH)\",\n");
        prompt.append("      \"explanation\": \"giải thích (TIẾNG VIỆT - chi tiết, dễ hiểu)\",\n");
        prompt.append("      \"severity\": \"HIGH|MEDIUM|LOW\"\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"nextQuestion\": {\n");
        prompt.append("    \"vietnameseSentence\": \"câu tiếp theo (TIẾNG VIỆT)\",\n");
        prompt.append("    \"expectedAnswer\": \"đáp án (TIẾNG ANH)\",\n");
        prompt.append("    \"sentenceType\": \"QUESTION|ANSWER\"\n");
        prompt.append("  }\n");
        prompt.append("}\n\n");

        // ========== PHẦN 9: VÍ DỤ ==========
        prompt.append("=== VÍ DỤ ===\n");
        prompt.append("Đầu vào: \n");
        prompt.append("- Câu Việt: Tôi đã đặt một phòng tại khách sạn gần sân bay.\n");
        prompt.append("- Bài dịch: I booked a room at hotel near airport.\n");
        prompt.append("- Đáp án đúng: I have booked a room at the hotel near the airport.\n");
        prompt.append("- Level: B1\n\n");
        prompt.append("Đầu ra:\n");
        prompt.append("{\n");
        prompt.append("  \"isCorrect\": false,\n");
        prompt.append("  \"score\": 65,\n");
        prompt.append("  \"naturalnessScore\": 70,\n");
        prompt.append("  \"feedback\": \"Câu trả lời của bạn đã truyền đạt đúng ý nhưng cần cải thiện một số điểm. Bạn đã dùng thì quá khứ đơn 'I booked', nhưng trong ngữ cảnh này nên dùng thì hiện tại hoàn thành 'I have booked' để nhấn mạnh hành động vừa mới xảy ra. Ngoài ra, bạn cần thêm mạo từ 'the' trước 'hotel' và 'airport'.\",\n");
        prompt.append("  \"betterAnswers\": [\"I have booked a room at the hotel near the airport.\"],\n");
        prompt.append("  \"errors\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"errorType\": \"TENSE\",\n");
        prompt.append("      \"userText\": \"I booked\",\n");
        prompt.append("      \"correctText\": \"I have booked\",\n");
        prompt.append("      \"explanation\": \"Bạn dùng thì quá khứ đơn, nhưng cần dùng thì hiện tại hoàn thành để diễn tả hành động vừa mới hoàn thành.\",\n");
        prompt.append("      \"severity\": \"MEDIUM\"\n");
        prompt.append("    },\n");
        prompt.append("    {\n");
        prompt.append("      \"errorType\": \"MISSING_WORD\",\n");
        prompt.append("      \"userText\": \"at hotel\",\n");
        prompt.append("      \"correctText\": \"at the hotel\",\n");
        prompt.append("      \"explanation\": \"Thiếu mạo từ 'the' trước 'hotel'.\",\n");
        prompt.append("      \"severity\": \"LOW\"\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"nextQuestion\": {\n");
        prompt.append("    \"vietnameseSentence\": \"Cô ấy đã mua một chiếc váy đỏ ở trung tâm mua sắm.\",\n");
        prompt.append("    \"expectedAnswer\": \"She has bought a red dress at the shopping mall.\",\n");
        prompt.append("    \"sentenceType\": \"ANSWER\"\n");
        prompt.append("  }\n");
        prompt.append("}\n\n");

        prompt.append("Lưu ý: Tuyệt đối không thêm bất kỳ text nào ngoài JSON.");

        return prompt.toString();
    }
    private AIGenerateResponse parseGenerateResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            return AIGenerateResponse.builder()
                    .vietnameseSentence(root.path("vietnameseSentence").asText())
                    .expectedAnswer(root.path("expectedAnswer").asText())
                    .sentenceType(root.path("sentenceType").asText())
                    .build();
        } catch (Exception e) {
            log.error("Lỗi parse phản hồi generate: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    private AIEvaluateResponse parseEvaluateResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            return parseEvaluateResponseRoot(root);
        } catch (Exception e) {
            log.error("Lỗi parse phản hồi evaluate: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    private AIEvaluateResponse parseEvaluateAndGenerateResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            AIEvaluateResponse evaluateResponse = parseEvaluateResponseRoot(root);

            JsonNode nextQuestion = root.path("nextQuestion");
            if (!nextQuestion.isMissingNode()) {
                AIGenerateResponse next = AIGenerateResponse.builder()
                        .vietnameseSentence(nextQuestion.path("vietnameseSentence").asText())
                        .expectedAnswer(nextQuestion.path("expectedAnswer").asText())
                        .sentenceType(nextQuestion.path("sentenceType").asText())
                        .build();
                evaluateResponse.setNextQuestion(next);
            }

            return evaluateResponse;
        } catch (Exception e) {
            log.error("Lỗi parse phản hồi evaluate and generate: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }


    private AIEvaluateResponse parseEvaluateResponseRoot(JsonNode root) {
        // ✅ VALIDATE VÀ CLEAN DATA
        boolean isCorrect = root.path("isCorrect").asBoolean(false);
        int score = root.path("score").asInt(0);
        int naturalnessScore = root.path("naturalnessScore").asInt(50);
        String feedback = root.path("feedback").asText("Không có phản hồi.");

        // ✅ ĐẢM BẢO ĐIỂM TRONG KHOẢNG 0-100
        score = Math.max(0, Math.min(100, score));
        naturalnessScore = Math.max(0, Math.min(100, naturalnessScore));

        // ✅ ĐẢM BẢO FEEDBACK BẰNG TIẾNG VIỆT (KIỂM TRA ĐƠN GIẢN)
        if (!feedback.isEmpty() && !feedback.matches(".*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ].*")) {
            // Nếu không có dấu tiếng Việt, thêm warning
            log.warn("⚠️ Feedback có thể không phải tiếng Việt: {}", feedback);
        }

        List<AIErrorResponse> errors = new ArrayList<>();
        JsonNode errorsNode = root.path("errors");
        if (errorsNode.isArray()) {
            for (JsonNode errorNode : errorsNode) {
                String errorType = errorNode.path("errorType").asText();
                String userText = errorNode.path("userText").asText();
                String correctText = errorNode.path("correctText").asText();
                String explanation = errorNode.path("explanation").asText();
                String severity = errorNode.path("severity").asText("MEDIUM");

                // ✅ SKIP ERROR NẾU THIẾU THÔNG TIN QUAN TRỌNG
                if (errorType == null || errorType.isEmpty() || explanation == null || explanation.isEmpty()) {
                    log.warn("⚠️ Bỏ qua error không hợp lệ: type={}, explanation={}", errorType, explanation);
                    continue;
                }

                errors.add(AIErrorResponse.builder()
                        .errorType(errorType)
                        .userText(userText != null ? userText : "")
                        .correctText(correctText != null ? correctText : "")
                        .explanation(explanation)
                        .severity(severity)
                        .build());
            }
        }

        List<String> betterAnswers = new ArrayList<>();
        JsonNode betterNode = root.path("betterAnswers");
        if (betterNode.isArray()) {
            for (JsonNode node : betterNode) {
                String answer = node.asText();
                if (answer != null && !answer.isEmpty()) {
                    betterAnswers.add(answer);
                }
            }
        }

        // ✅ NẾU KHÔNG CÓ BETTER ANSWERS, THÊM EXPECTED ANSWER
        if (betterAnswers.isEmpty()) {
            String expected = root.path("expectedAnswer").asText();
            if (expected != null && !expected.isEmpty()) {
                betterAnswers.add(expected);
            }
        }

        return AIEvaluateResponse.builder()
                .isCorrect(isCorrect)
                .score(score)
                .naturalnessScore(naturalnessScore)
                .feedback(feedback)
                .betterAnswers(betterAnswers)
                .errors(errors)
                .build();
    }
    private String callGeminiWithRetry(String prompt, int maxRetries) {
        int attempt = 0;
        String lastError = null;

        while (attempt < maxRetries) {
            try {
                String response = callGemini(prompt);

                // Validate response là JSON hợp lệ
                try {
                    objectMapper.readTree(response);
                    log.info("✅ Gemini response successful after {} attempt(s)", attempt + 1);
                    return response;
                } catch (Exception e) {
                    log.warn("⚠️ Response không phải JSON hợp lệ, thử lại lần {}", attempt + 1);
                    lastError = "Invalid JSON response";
                    attempt++;
                }
            } catch (Exception e) {
                log.error("❌ Lỗi gọi Gemini, thử lại lần {}", attempt + 1, e);
                lastError = e.getMessage();
                attempt++;

                // Đợi một chút trước khi retry
                try {
                    Thread.sleep(1000 * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        log.error("❌ All {} retry attempts failed. Last error: {}", maxRetries, lastError);
        throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "AI service failed after " + maxRetries + " retries: " + lastError);
    }
    private AIEvaluateResponse createSafeFallbackResponse(AIEvaluateRequest request) {
        log.info("Tạo fallback response an toàn");

        // Đánh giá đơn giản dựa trên từ khóa
        String studentAnswer = request.getStudentAnswer().toLowerCase();
        String expectedAnswer = request.getExpectedAnswer().toLowerCase();

        // Loại bỏ dấu câu và khoảng trắng thừa
        studentAnswer = studentAnswer.replaceAll("[^a-zA-Z ]", "").trim();
        expectedAnswer = expectedAnswer.replaceAll("[^a-zA-Z ]", "").trim();

        // So sánh từ khóa chính
        String[] expectedWords = expectedAnswer.split(" ");
        int matchCount = 0;
        for (String word : expectedWords) {
            if (word.length() > 3 && studentAnswer.contains(word)) {
                matchCount++;
            }
        }

        double matchRatio = expectedWords.length > 0 ? (double) matchCount / expectedWords.length : 0;
        boolean isCorrect = matchRatio >= 0.6;
        int score = (int) Math.round(matchRatio * 100);

        // Tạo câu hỏi tiếp theo đơn giản
        String nextVietnamese = "Tôi thích học tiếng Anh.";
        String nextExpected = "I like learning English.";

        return AIEvaluateResponse.builder()
                .isCorrect(isCorrect)
                .score(score)
                .naturalnessScore(Math.min(score + 10, 100))
                .feedback(isCorrect ?
                        "✅ Câu trả lời của bạn tương đối tốt! Tiếp tục cố gắng nhé." :
                        "⚠️ Câu trả lời chưa chính xác. Hãy tham khảo đáp án gợi ý.")
                .betterAnswers(List.of(request.getExpectedAnswer()))
                .errors(new ArrayList<>())
                .nextQuestion(AIGenerateResponse.builder()
                        .vietnameseSentence(nextVietnamese)
                        .expectedAnswer(nextExpected)
                        .sentenceType("QUESTION")
                        .build())
                .build();
    }

}