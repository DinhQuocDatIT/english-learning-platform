package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.request.LevelCreateRequest;
import com.englishlearning.backend.dto.request.LevelUpdateRequest;
import com.englishlearning.backend.dto.response.LevelResponse;
import com.englishlearning.backend.entity.Level;
import com.englishlearning.backend.exception.BusinessException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.LevelRepository;
import com.englishlearning.backend.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LevelServiceImpl implements LevelService {

    private final LevelRepository levelRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LevelResponse> getAll() {

        return levelRepository
                .findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LevelResponse getById(Long id) {

        Level level = findActiveById(id);

        return toResponse(level);
    }

    @Override
    public LevelResponse create(LevelCreateRequest request) {

        String name = request.getName().trim();

        if (levelRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(name)) {
            throw new BusinessException(
                    "Tên level đã tồn tại"
            );
        }
        Level level = new Level();
        level.setName(name);
        level.setDescription(request.getDescription());
        level.setColor(request.getColor());
        Level saved = levelRepository.save(level);
        return toResponse(saved);
    }

    @Override
    public LevelResponse update(
            Long id,
            LevelUpdateRequest request
    ) {

        Level level = findActiveById(id);

        String name = request.getName().trim();

        if (levelRepository
                .existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(name, id)) {

            throw new BusinessException(
                    "Tên level đã tồn tại"
            );
        }
        level.setName(name);
        level.setDescription(request.getDescription());
        level.setColor(request.getColor());
        Level updated = levelRepository.save(level);
        return toResponse(updated);
    }

    @Override
    public void lock(Long id) {

        Level level = findActiveById(id);

        level.setDeletedAt(LocalDateTime.now());

        levelRepository.save(level);
    }

    @Override
    public void unlock(Long id) {

        Level level = levelRepository
                .findByIdAndDeletedAtIsNotNull(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy level đang bị khóa với id: " + id
                        )
                );

        level.setDeletedAt(null);

        levelRepository.save(level);
    }

    private Level findActiveById(Long id) {

        return levelRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy level đang hoạt động với id: " + id
                        )
                );
    }

    private LevelResponse toResponse(Level level) {

        return LevelResponse.builder()
                .id(level.getId())
                .name(level.getName())
                .description(level.getDescription())
                .color(level.getColor())
                .createdAt(level.getCreatedAt())
                .updatedAt(level.getUpdatedAt())
                .build();
    }
}