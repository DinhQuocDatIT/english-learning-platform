package com.englishlearning.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DictWordListItemResponse {
    private Long id;
    private String word;
    private String pronunciation;
    private String langCode;
    private Integer meaningCount;
}