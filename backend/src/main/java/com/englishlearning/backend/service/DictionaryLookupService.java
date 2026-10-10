package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.response.WordLookupResponse;

import java.util.List;

public interface DictionaryLookupService {

    WordLookupResponse lookup(String word);

    List<WordLookupResponse> search(String keyword, int limit);
    List<WordLookupResponse> findExact(String word);
}