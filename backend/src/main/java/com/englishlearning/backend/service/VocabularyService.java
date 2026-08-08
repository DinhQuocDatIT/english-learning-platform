package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.VocabularyRequest;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.VocabularyResponse;

import java.util.List;

public interface VocabularyService {
    VocabularyResponse create(VocabularyRequest request);
    VocabularyResponse update(Long id, VocabularyRequest request);
    void delete(Long id);
    VocabularyResponse getById(Long id);

    PageResponse<VocabularyResponse> getAllByPage(int page, int size);

}
