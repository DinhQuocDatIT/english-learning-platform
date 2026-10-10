package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.DictWordDetailResponse;
import com.englishlearning.backend.dto.response.DictWordListItemResponse;
import com.englishlearning.backend.dto.response.PageResponse;
import com.englishlearning.backend.dto.response.WordLookupResponse;
import com.englishlearning.backend.entity.*;
import com.englishlearning.backend.exception.ResourceNotFoundException;
import com.englishlearning.backend.repository.*;
import com.englishlearning.backend.service.DictWordManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DictWordManagementServiceImpl implements DictWordManagementService {

    private final DictWordRepository wordRepo;
    private final DictDefinitionRepository definitionRepo;
    private final DictWordDefinitionRepository wordDefRepo;
    private final DictPronunciationRepository pronunciationRepo;
    private final DictTranslationRepository translationRepo;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DictWordListItemResponse> list(
            int page, int size, String keyword
    ) {
        if (page < 0) page = 0;
        if (size <= 0) size = 10;
        if (size > 100) size = 100;
        if (keyword == null) keyword = "";

        Pageable pageable = PageRequest.of(page, size);

        Page<DictWord> result;

        if (keyword.isBlank()) {
            result = wordRepo.findByLangCode("en", pageable);
        } else {
            result = wordRepo.searchByLangAndKeyword("en", keyword.trim(), pageable);
        }

        List<DictWord> words = result.getContent();

        if (words.isEmpty()) {
            return PageResponse.<DictWordListItemResponse>builder()
                    .content(List.of())
                    .currentPage(result.getNumber())
                    .pageSize(result.getSize())
                    .totalElements(result.getTotalElements())
                    .totalPages(result.getTotalPages())
                    .first(result.isFirst())
                    .last(result.isLast())
                    .build();
        }

        List<Long> wordIds = words.stream()
                .map(DictWord::getId)
                .toList();

        Map<Long, String> pronunciationMap = pronunciationRepo
                .findByWordIdIn(wordIds)
                .stream()
                .filter(p -> p.getIpa() != null && !p.getIpa().isBlank())
                .collect(Collectors.toMap(
                        DictPronunciation::getWordId,
                        DictPronunciation::getIpa,
                        (a, b) -> a
                ));

        Map<Long, Long> meaningCountMap = wordDefRepo
                .countByWordIdIn(wordIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        List<DictWordListItemResponse> content = words.stream()
                .map(w -> DictWordListItemResponse.builder()
                        .id(w.getId())
                        .word(w.getWord())
                        .pronunciation(pronunciationMap.get(w.getId()))
                        .langCode(w.getLangCode())
                        .meaningCount(
                                meaningCountMap.getOrDefault(w.getId(), 0L).intValue()
                        )
                        .build())
                .toList();

        return PageResponse.<DictWordListItemResponse>builder()
                .content(content)
                .currentPage(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DictWordDetailResponse getDetail(Long id) {
        DictWord word = wordRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy từ với id: " + id
                ));

        String pronunciation = pronunciationRepo.findByWordId(word.getId())
                .stream()
                .map(DictPronunciation::getIpa)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .findFirst()
                .orElse(null);

        List<WordLookupResponse.WordLookupMeaning> meanings = new ArrayList<>();

        if ("en".equalsIgnoreCase(word.getLangCode())) {
            List<DictWordDefinition> wordDefs = wordDefRepo.findByWordId(word.getId());

            for (DictWordDefinition wd : wordDefs) {
                Optional<DictDefinition> defOpt = definitionRepo.findById(wd.getDefinitionId());
                if (defOpt.isEmpty()) continue;

                DictDefinition def = defOpt.get();

                if (def.getDefinitionLang() == null
                        || !def.getDefinitionLang().equalsIgnoreCase("vi")) {
                    continue;
                }

                // 👇 pos "X" trả null → bị skip
                String posFull = mapPos(def.getPos());
                if (posFull == null || posFull.isBlank()) continue;

                String meaning = def.getDefinition();
                if (meaning == null || meaning.isBlank()) continue;

                if (meaning.endsWith(".")) {
                    meaning = meaning.substring(0, meaning.length() - 1);
                }

                String example = wd.getExample();
                if (example != null && example.length() < 15) {
                    example = null;
                }

                meanings.add(WordLookupResponse.WordLookupMeaning.builder()
                        .partOfSpeech(posFull)
                        .meaning(meaning)
                        .example(example)
                        .build());

                if (meanings.size() >= 50) break;
            }
        }

        List<String> translations = new ArrayList<>();
        if ("vi".equalsIgnoreCase(word.getLangCode())) {
            List<DictTranslation> trans = translationRepo.findByWordId(word.getId());
            for (DictTranslation t : trans) {
                if (t.getLangCode() == null) continue;
                if (!t.getLangCode().equalsIgnoreCase("en")) continue;
                if (t.getTranslation() == null || t.getTranslation().isBlank()) continue;
                translations.add(t.getTranslation().trim());
            }
        }

        return DictWordDetailResponse.builder()
                .id(word.getId())
                .word(word.getWord())
                .pronunciation(pronunciation)
                .langCode(word.getLangCode())
                .meanings(meanings)
                .translations(translations)
                .build();
    }

    /**
     * Map POS codes sang tiếng Việt.
     * 👇 "X" (Unknown) → null để bị filter bỏ
     */
    private String mapPos(String pos) {
        if (pos == null || pos.isBlank()) return null;

        String code = pos.trim().toUpperCase();

        return switch (code) {
            case "N", "NOUN" -> "Danh từ";
            case "V", "VERB" -> "Động từ";
            case "A", "ADJ", "ADJECTIVE" -> "Tính từ";
            case "R", "ADV", "ADVERB" -> "Trạng từ";
            case "P", "PRON", "PRONOUN" -> "Đại từ";
            case "D", "DET", "DETERMINER" -> "Hạn định từ";
            case "M", "NUM", "NUMERAL" -> "Số từ";
            case "C", "CONJ", "CONJUNCTION" -> "Liên từ";
            case "I", "PRE", "PREPOSITION" -> "Giới từ";
            case "O", "ADP", "ADPOSITION" -> "Giới từ";
            case "E", "INT", "INTERJECTION" -> "Thán từ";
            case "S", "SUFFIX", "SATELLITE" -> "Hậu tố";
            case "Z", "PHRASE", "MULTIWORD" -> "Cụm từ";

            // 👇 ẨN
            case "X", "UNKNOWN" -> null;

            default -> null;
        };
    }
}