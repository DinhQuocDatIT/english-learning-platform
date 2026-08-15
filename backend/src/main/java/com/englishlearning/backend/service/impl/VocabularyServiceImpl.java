package com.englishlearning.backend.service.impl;


import com.englishlearning.backend.dto.request.VocabularyRequest;
import com.englishlearning.backend.dto.response.ImportVocabularyResponse;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.VocabularyResponse;
import com.englishlearning.backend.entity.Vocabulary;
import com.englishlearning.backend.entity.VocabularyMeaning;
import com.englishlearning.backend.exception.DuplicateException;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.mapper.VocabularyMapper;
import com.englishlearning.backend.repository.VocabularyRepository;
import com.englishlearning.backend.service.VocabularyService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class VocabularyServiceImpl
        implements VocabularyService {

    private final VocabularyRepository repository;

    private final VocabularyMapper mapper;

    @Override
    @Transactional
    public List<VocabularyResponse> searchForLearner(String keyword) {

        if (keyword == null || keyword.trim().isBlank()) {
            return List.of();
        }

        List<Vocabulary> vocabularies =
                repository.searchForLearner(keyword.trim());

        return vocabularies
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

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
    public void restore(Long id) {
        Vocabulary vocabulary = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy từ vựng với id: " + id
                        )
                );

        if (vocabulary.getDeletedAt() == null) {
            throw new IllegalStateException("Từ vựng này đang hoạt động.");
        }

        vocabulary.setDeletedAt(null);

        repository.save(vocabulary);
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
    public PageResponse<VocabularyResponse> getAllByPage(
            int page,
            int size,
            String keyword,
            String status
    ) {

        if (page < 0) {
            page = 0;
        }

        if (size <= 0) {
            size = 10;
        }

        if (size > 100) {
            size = 100;
        }

        if (keyword == null) {
            keyword = "";
        }

        if (status == null || status.isBlank()) {
            status = "ALL";
        }

        Pageable pageable = PageRequest.of(page, size);

        Page<Vocabulary> vocabularyPage =
                repository.searchVocabulary(
                        keyword.trim(),
                        status,
                        pageable
                );

        return PageResponse
                .<VocabularyResponse>builder()
                .content(
                        vocabularyPage
                                .getContent()
                                .stream()
                                .map(mapper::toResponse)
                                .toList()
                )
                .currentPage(vocabularyPage.getNumber())
                .pageSize(vocabularyPage.getSize())
                .totalElements(vocabularyPage.getTotalElements())
                .totalPages(vocabularyPage.getTotalPages())
                .first(vocabularyPage.isFirst())
                .last(vocabularyPage.isLast())
                .build();
    }



    @Override
    @Transactional
    public ImportVocabularyResponse importCsv(MultipartFile file) {
        validateFile(file);

        int totalRows = 0;
        int successCount = 0;
        int duplicateCount = 0;
        int errorCount = 0;
        List<String> errors = new ArrayList<>();
        List<String> duplicates = new ArrayList<>();

        // Gom nhóm các dòng theo word
        Map<String, List<CSVRecord>> groupedRecords = new LinkedHashMap<>();

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CSVParser parser = CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .setTrim(true)
                    .build()
                    .parse(reader);

            // Đọc và validate từng dòng
            for (CSVRecord record : parser) {
                totalRows++;

                try {
                    // Kiểm tra các field bắt buộc
                    String word = record.get("word").trim();
                    if (word.isBlank()) {
                        errorCount++;
                        errors.add("Dòng " + record.getRecordNumber() + ": Word không được để trống");
                        continue;
                    }

                    String meaning = record.get("meaning").trim();
                    if (meaning.isBlank()) {
                        errorCount++;
                        errors.add("Dòng " + record.getRecordNumber() + ": Meaning không được để trống");
                        continue;
                    }

                    String partOfSpeech = record.get("partOfSpeech").trim();
                    if (partOfSpeech.isBlank()) {
                        errorCount++;
                        errors.add("Dòng " + record.getRecordNumber() + ": Part of Speech không được để trống");
                        continue;
                    }

                    // Thêm vào nhóm
                    groupedRecords.computeIfAbsent(word.toLowerCase(), k -> new ArrayList<>()).add(record);

                } catch (Exception e) {
                    errorCount++;
                    errors.add("Dòng " + record.getRecordNumber() + ": " + e.getMessage());
                }
            }

            // Xử lý từng nhóm word
            for (Map.Entry<String, List<CSVRecord>> entry : groupedRecords.entrySet()) {
                List<CSVRecord> records = entry.getValue();
                CSVRecord firstRecord = records.get(0);
                String word = firstRecord.get("word").trim();

                // Tìm từ trong DB 1 lần duy nhất
                Optional<Vocabulary> existingOpt = repository.findByWordIgnoreCase(word);

                if (existingOpt.isEmpty()) {
                    // === TRƯỜNG HỢP 1: TỪ CHƯA TỒN TẠI ===
                    // Tạo mới vocabulary với tất cả meanings
                    Vocabulary vocabulary = new Vocabulary();
                    vocabulary.setWord(word);
                    vocabulary.setPronunciation(firstRecord.get("pronunciation").trim());

                    List<VocabularyMeaning> meanings = new ArrayList<>();
                    for (CSVRecord record : records) {
                        VocabularyMeaning meaning = new VocabularyMeaning();
                        meaning.setPartOfSpeech(record.get("partOfSpeech").trim());
                        meaning.setMeaning(record.get("meaning").trim());
                        meaning.setExample(record.get("example").trim());
                        meaning.setVocabulary(vocabulary);
                        meanings.add(meaning);
                    }
                    vocabulary.setMeanings(meanings);
                    repository.save(vocabulary);

                    // Mỗi record là 1 meaning được thêm thành công
                    successCount += records.size();

                } else {
                    // === TRƯỜNG HỢP 2: TỪ ĐÃ TỒN TẠI ===
                    Vocabulary existingVocab = existingOpt.get();

                    // Tạo Set chứa các meaning đã tồn tại (để check nhanh)
                    Set<String> existingMeaningKeys = existingVocab.getMeanings().stream()
                            .map(m -> m.getMeaning().toLowerCase() + "|" + m.getPartOfSpeech().toLowerCase())
                            .collect(Collectors.toSet());

                    List<VocabularyMeaning> newMeanings = new ArrayList<>();

                    for (CSVRecord record : records) {
                        String meaning = record.get("meaning").trim();
                        String partOfSpeech = record.get("partOfSpeech").trim();
                        String key = meaning.toLowerCase() + "|" + partOfSpeech.toLowerCase();

                        if (existingMeaningKeys.contains(key)) {
                            // Trùng lặp: word + meaning + partOfSpeech đã tồn tại
                            duplicateCount++;
                            duplicates.add(String.format("'%s' - %s: '%s' (đã tồn tại)",
                                    word, partOfSpeech, meaning));
                        } else {
                            // Thêm nghĩa mới cho từ đã có
                            VocabularyMeaning newMeaning = new VocabularyMeaning();
                            newMeaning.setPartOfSpeech(partOfSpeech);
                            newMeaning.setMeaning(meaning);
                            newMeaning.setExample(record.get("example").trim());
                            newMeaning.setVocabulary(existingVocab);
                            newMeanings.add(newMeaning);
                            successCount++;
                        }
                    }

                    // Lưu tất cả nghĩa mới cùng lúc
                    if (!newMeanings.isEmpty()) {
                        existingVocab.getMeanings().addAll(newMeanings);
                        repository.save(existingVocab);
                    }
                }
            }

        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc file CSV", e);
        }

        return ImportVocabularyResponse.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .duplicateCount(duplicateCount)
                .errorCount(errorCount)
                .errors(errors)
                .duplicates(duplicates)
                .build();
    }



    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            throw new IllegalArgumentException("Chỉ hỗ trợ file CSV");
        }
    }
}