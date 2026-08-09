package com.englishlearning.backend.controller;

import com.englishlearning.backend.dto.request.VocabularyRequest;
import com.englishlearning.backend.dto.response.ApiResponse;
import com.englishlearning.backend.dto.response.ImportVocabularyResponse;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.VocabularyResponse;
import com.englishlearning.backend.service.VocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vocabularies")
@RequiredArgsConstructor
public class VocabularyController {


    private final VocabularyService vocabularyService;


    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<ApiResponse<VocabularyResponse>> create(
            @Valid @RequestBody VocabularyRequest request
    ){

        VocabularyResponse response =
                vocabularyService.create(request);


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                201,
                                "Thêm từ vựng thành công",
                                response
                        )
                );
    }



    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<VocabularyResponse>>> getAll(
            @RequestParam(defaultValue = "1")int page,@RequestParam(defaultValue = "10") int size
    ){

        PageResponse<VocabularyResponse> response = vocabularyService.getAllByPage(page-1,size);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy danh sách từ vựng thành công",
                       response
                )
        );
    }



    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VocabularyResponse>> getById(
            @PathVariable Long id
    ){

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Lấy thông tin từ vựng thành công",
                        vocabularyService.getById(id)
                )
        );
    }


    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VocabularyResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody VocabularyRequest request
    ){

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Cập nhật từ vựng thành công",
                        vocabularyService.update(id, request)
                )
        );
    }


    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id
    ){

        vocabularyService.delete(id);


        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Xóa từ vựng thành công",
                        null
                )
        );
    }
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<
            ApiResponse<ImportVocabularyResponse>
            > importCsv(
            @RequestParam("file") MultipartFile file
    ) {

        ImportVocabularyResponse response =
                vocabularyService.importCsv(file);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Import từ vựng thành công",
                        response
                )
        );
    }
}