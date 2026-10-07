package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.DictWordDetailResponse;
import com.englishlearning.backend.dto.response.DictWordListItemResponse;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.service.DictWordManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dict-words")
@RequiredArgsConstructor
public class DictWordManagementController {

    private final DictWordManagementService dictWordManagementService;

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DictWordListItemResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String keyword
    ) {
        PageResponse<DictWordListItemResponse> result =
                dictWordManagementService.list(page, size, keyword);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Lấy danh sách từ điển thành công",
                result
        ));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DictWordDetailResponse>> detail(
            @PathVariable Long id
    ) {
        DictWordDetailResponse result =
                dictWordManagementService.getDetail(id);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Lấy chi tiết từ thành công",
                result
        ));
    }
}