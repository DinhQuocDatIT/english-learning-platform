package com.englishlearning.backend.service.impl;


import com.englishlearning.backend.dto.request.VocabularyRequest;
import com.englishlearning.backend.dto.response.VocabularyResponse;
import com.englishlearning.backend.entity.Vocabulary;
import com.englishlearning.backend.exception.DuplicateException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.mapper.VocabularyMapper;
import com.englishlearning.backend.repository.VocabularyRepository;
import com.englishlearning.backend.service.VocabularyService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class VocabularyServiceImpl
        implements VocabularyService {


    private final VocabularyRepository repository;

    private final VocabularyMapper mapper;



    @Override
    public VocabularyResponse create(
            VocabularyRequest request
    ){
        if(repository.existsByWordIgnoreCase(request.getWord())){
            throw new DuplicateException("Từ vựng đã tồn tại: " + request.getWord());
        }
        Vocabulary vocabulary = mapper.toEntity(request);
        Vocabulary saved = repository.save(vocabulary);
        return mapper.toResponse(saved);
    }
    @Override
    public VocabularyResponse update(Long id, VocabularyRequest request){
        Vocabulary vocabulary = repository.findByIdAndDeletedAtIsNull(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Không tìm thấy từ vựng với id: " + id));
        mapper.updateEntity(
                vocabulary,
                request
        );
        Vocabulary saved = repository.save(vocabulary);
        return mapper.toResponse(saved);
    }





    @Override
    public void delete(Long id){Vocabulary vocabulary =
                repository.findByIdAndDeletedAtIsNull(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy từ vựng với id: " + id));
        vocabulary.setDeletedAt(LocalDateTime.now());
        repository.save(vocabulary);
    }


    @Override
    public VocabularyResponse getById(
            Long id
    ){

        Vocabulary vocabulary = repository.findByIdAndDeletedAtIsNull(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy từ vựng với id: " + id));
        return mapper.toResponse(vocabulary);
    }





    @Override
    public List<VocabularyResponse> getAll(){

        return repository
                .findByDeletedAtIsNull()
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

}