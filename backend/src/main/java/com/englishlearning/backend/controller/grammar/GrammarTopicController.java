package com.englishlearning.backend.controller.grammar;

import com.englishlearning.backend.dto.grammar.response.GrammarExampleResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarQuizSummaryResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTipResponse;
import com.englishlearning.backend.dto.grammar.response.GrammarTopicDetailResponse;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.security.CustomUserDetails;
import com.englishlearning.backend.service.grammar.GrammarExampleService;
import com.englishlearning.backend.service.grammar.GrammarQuizService;
import com.englishlearning.backend.service.grammar.GrammarTipService;
import com.englishlearning.backend.service.grammar.GrammarTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/grammar/topics")
@RequiredArgsConstructor
public class GrammarTopicController {
    private final GrammarQuizService quizService;
    private final GrammarTopicService topicService;
    private final GrammarExampleService exampleService;
    private final GrammarTipService tipService;
    /**
     * Lấy chi tiết topic kèm danh sách lý thuyết PUBLISHED
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GrammarTopicDetailResponse>> getTopicDetail(
            @PathVariable Long id
    ) {
        GrammarTopicDetailResponse response = topicService.getTopicDetail(id);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy chi tiết chủ điểm thành công",
                        response
                )
        );
    }

    /**
     * Lấy danh sách ví dụ PUBLISHED của topic (cho Student xem)
     */
    @GetMapping("/{id}/examples")
    public ResponseEntity<ApiResponse<List<GrammarExampleResponse>>> getPublishedExamples(
            @PathVariable Long id
    ) {
        List<GrammarExampleResponse> response =
                exampleService.getPublishedExamples(id);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách ví dụ thành công",
                        response
                )
        );
    }
    @GetMapping("/{id}/tips")
    public ResponseEntity<ApiResponse<List<GrammarTipResponse>>> getPublishedTips(
            @PathVariable Long id
    ) {
        List<GrammarTipResponse> response = tipService.getPublishedTips(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(200, "Lấy danh sách mẹo thành công", response));
    }
    @GetMapping("/{id}/quizzes")
    public ResponseEntity<ApiResponse<List<GrammarQuizSummaryResponse>>> getPublishedQuizzes(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails != null ? userDetails.getUser().getId() : null;
        List<GrammarQuizSummaryResponse> response =
                quizService.getPublishedQuizzes(id, userId);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(200, "Lấy danh sách đề thành công", response));
    }
}