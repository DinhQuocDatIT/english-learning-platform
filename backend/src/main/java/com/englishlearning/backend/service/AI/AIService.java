package com.englishlearning.backend.service.AI;


import com.englishlearning.backend.dto.request.AIEvaluateRequest;
import com.englishlearning.backend.dto.request.AIGenerateRequest;
import com.englishlearning.backend.dto.request.CreatePracticeRequest;
import com.englishlearning.backend.dto.request.SubmitAnswerRequest;
import com.englishlearning.backend.dto.response.*;

import java.util.List;

public interface AIService {
    AIGenerateResponse generateSentence(AIGenerateRequest request);
    AIEvaluateResponse evaluateAnswer(AIEvaluateRequest request);
    AIEvaluateResponse evaluateAndGenerate(AIEvaluateRequest request);
}