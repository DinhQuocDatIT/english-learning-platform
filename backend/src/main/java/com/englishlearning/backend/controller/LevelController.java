package com.englishlearning.backend.controller;
import com.englishlearning.backend.dto.request.LevelCreateRequest;
import com.englishlearning.backend.dto.request.LevelUpdateRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.LevelResponse;
import com.englishlearning.backend.service.LevelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/levels")
@RequiredArgsConstructor
public class LevelController {

    private final LevelService levelService;


    @GetMapping
    public ResponseEntity<ApiResponse<List<LevelResponse>>> getAll() {

        List<LevelResponse> levels =
                levelService.getAll();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách level thành công",
                        levels
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LevelResponse>> getById(
            @PathVariable Long id
    ) {

        LevelResponse response =
                levelService.getById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy thông tin level thành công",
                        response
                )
        );
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<LevelResponse>> create(
            @Valid @RequestBody LevelCreateRequest request
    ) {

        LevelResponse response =
                levelService.create(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Tạo level thành công",
                        response
                )
        );
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LevelResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody LevelUpdateRequest request
    ) {

        LevelResponse response =
                levelService.update(id, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Cập nhật level thành công",
                        response
                )
        );
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<Void>> lock(
            @PathVariable Long id
    ) {

        levelService.lock(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Khóa level thành công",
                        null
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<Void>> unlock(
            @PathVariable Long id
    ) {

        levelService.unlock(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Mở khóa level thành công",
                        null
                )
        );
    }
}