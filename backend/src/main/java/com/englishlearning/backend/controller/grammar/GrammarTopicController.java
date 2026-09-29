package com.englishlearning.backend.controller.grammar;

import com.englishlearning.backend.dto.grammar.response.GrammarTopicDetailResponse;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.service.grammar.GrammarTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/grammar/topics")
@RequiredArgsConstructor
public class GrammarTopicController {

    private final GrammarTopicService topicService;

    /**
     * Lấy chi tiết topic kèm danh sách lý thuyết PUBLISHED
     * Dùng cho trang chi tiết chủ điểm (4 tab: Lý thuyết / Mẹo / Ví dụ / Trắc nghiệm)
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
}