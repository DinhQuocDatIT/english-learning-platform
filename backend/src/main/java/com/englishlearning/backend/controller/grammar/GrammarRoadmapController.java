package com.englishlearning.backend.controller.grammar;

import com.englishlearning.backend.dto.grammar.response.GrammarRoadmapResponse;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.service.grammar.GrammarRoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/grammar/roadmaps")
@RequiredArgsConstructor
public class GrammarRoadmapController {

    private final GrammarRoadmapService roadmapService;

    /**
     * Lấy tất cả lộ trình (TOEIC 600 / 800 / 900+)
     * Ai cũng xem được — không cần đăng nhập
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<GrammarRoadmapResponse>>> getAllRoadmaps() {
        List<GrammarRoadmapResponse> response = roadmapService.getAllRoadmaps();

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách lộ trình ngữ pháp thành công",
                        response
                )
        );
    }

    /**
     * Lấy chi tiết lộ trình + cây topic PUBLISHED
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GrammarRoadmapResponse>> getRoadmapDetail(
            @PathVariable Long id
    ) {
        GrammarRoadmapResponse response = roadmapService.getRoadmapDetail(id);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        200,
                        "Lấy chi tiết lộ trình thành công",
                        response
                )
        );
    }
}