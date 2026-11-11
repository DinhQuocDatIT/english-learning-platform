package com.englishlearning.backend.service.AI;

import com.englishlearning.backend.dto.request.AIEvaluateRequest;
import com.englishlearning.backend.dto.request.AIGenerateRequest;
import com.englishlearning.backend.dto.response.AIEvaluateResponse;
import com.englishlearning.backend.dto.response.AIGenerateResponse;

public interface AIService {

    /**
     * Sinh 1 câu tiếng Việt để học viên dịch sang tiếng Anh.
     * Dùng cho cả câu đầu tiên và câu tiếp theo.
     */
    AIGenerateResponse generateSentence(AIGenerateRequest request);

    /**
     * Chấm bài dịch của học viên.
     * Chỉ chấm — KHÔNG sinh câu tiếp theo (tách riêng khỏi generate).
     */
    AIEvaluateResponse evaluateAnswer(AIEvaluateRequest request);
}