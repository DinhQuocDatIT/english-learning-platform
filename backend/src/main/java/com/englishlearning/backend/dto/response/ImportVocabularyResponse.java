package com.englishlearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportVocabularyResponse {
    private int totalRows;
    private int successCount;
    private int duplicateCount;
    private int errorCount;
    private List<String> errors;
    private List<String> duplicates;
}