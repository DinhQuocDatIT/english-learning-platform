package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.WordLookupResponse;
import com.englishlearning.backend.service.DictionaryLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dictionary")
@RequiredArgsConstructor
public class DictionaryLookupController {

    private final DictionaryLookupService dictionaryLookupService;

    @GetMapping("/lookup")
    public ResponseEntity<ApiResponse<WordLookupResponse>> lookup(
            @RequestParam String word
    ) {
        WordLookupResponse response = dictionaryLookupService.lookup(word);

        if (response == null) {
            return ResponseEntity.ok(new ApiResponse<>(
                    404,
                    "Không tìm thấy từ: " + word,
                    null
            ));
        }

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Tra từ thành công",
                response
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<WordLookupResponse>>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<WordLookupResponse> results =
                dictionaryLookupService.search(keyword, limit);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Tìm kiếm thành công",
                results
        ));
    }
}