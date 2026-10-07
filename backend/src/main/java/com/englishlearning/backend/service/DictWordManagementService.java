package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.response.DictWordDetailResponse;
import com.englishlearning.backend.dto.response.DictWordListItemResponse;
import com.englishlearning.backend.dto.response.PageResponse;

public interface DictWordManagementService {

    PageResponse<DictWordListItemResponse> list(
            int page,
            int size,
            String keyword
    );

    DictWordDetailResponse getDetail(Long id);
}