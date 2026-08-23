package com.englishlearning.backend.service;

import com.englishlearning.backend.dto.request.LevelCreateRequest;
import com.englishlearning.backend.dto.request.LevelUpdateRequest;
import com.englishlearning.backend.dto.response.LevelResponse;

import java.util.List;

public interface LevelService {

    List<LevelResponse> getAll();

    LevelResponse getById(Long id);

    LevelResponse create(LevelCreateRequest request);

    LevelResponse update(Long id, LevelUpdateRequest request);


    void lock(Long id);

    void unlock(Long id);
}