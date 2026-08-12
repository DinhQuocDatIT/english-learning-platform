package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.VocabularyRequest;
import com.englishlearning.backend.dto.response.ImportVocabularyResponse;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.StudentResponse;
import com.englishlearning.backend.dto.response.VocabularyResponse;
import com.englishlearning.backend.entity.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VocabularyService {
    VocabularyResponse create(VocabularyRequest request);
    VocabularyResponse update(Long id, VocabularyRequest request);
    void delete(Long id);
    VocabularyResponse getById(Long id);
    void restore(Long id);

    public PageResponse<VocabularyResponse> getAllByPage(
            int page,
            int size,
            String keyword,
            String status
    );
    ImportVocabularyResponse importCsv(MultipartFile file);

}
