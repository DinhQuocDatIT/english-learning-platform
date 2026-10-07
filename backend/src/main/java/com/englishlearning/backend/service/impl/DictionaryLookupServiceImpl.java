package com.englishlearning.backend.service.impl;

import com.englishlearning.backend.dto.response.WordLookupResponse;
import com.englishlearning.backend.entity.*;
import com.englishlearning.backend.repository.*;
import com.englishlearning.backend.service.DictionaryLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DictionaryLookupServiceImpl implements DictionaryLookupService {

    private final DictWordRepository wordRepo;
    private final DictDefinitionRepository definitionRepo;
    private final DictWordDefinitionRepository wordDefRepo;
    private final DictPronunciationRepository pronunciationRepo;
    private final DictTranslationRepository translationRepo;

    @Override
    public WordLookupResponse lookup(String word) {
        if (word == null || word.isBlank()) return null;

        String normalized = Normalizer.normalize(word.trim(), Normalizer.Form.NFC);

        boolean isVietnamese = containsVietnameseChars(normalized);
        System.out.println(">>> Lookup: [" + normalized + "] lang=" + (isVietnamese ? "vi" : "en"));

        if (isVietnamese) {
            List<DictWord> viCandidates = wordRepo.findByWordAndLang(normalized, "vi");
            if (viCandidates.isEmpty()) {
                viCandidates = wordRepo.findAllByWordIgnoreCase(normalized);
            }

            Set<String> englishWords = new LinkedHashSet<>();
            for (DictWord viWord : viCandidates) {
                List<DictTranslation> translations = translationRepo.findByWordId(viWord.getId());
                for (DictTranslation t : translations) {
                    if (t.getTranslation() == null) continue;
                    if (t.getLangCode() == null || !t.getLangCode().equalsIgnoreCase("en")) continue;
                    String en = t.getTranslation().trim();
                    if (!en.isEmpty()) englishWords.add(en);
                }
            }

            if (!englishWords.isEmpty()) {
                List<WordLookupResponse.WordLookupMeaning> mergedMeanings = new ArrayList<>();
                String pronunciation = null;
                String displayWord = normalized;

                for (String en : englishWords) {
                    WordLookupResponse enResp = lookupEnglish(en);
                    if (enResp == null) continue;

                    if (pronunciation == null && enResp.getPronunciation() != null) {
                        pronunciation = enResp.getPronunciation();
                    }
                    if (displayWord.equals(normalized)) {
                        displayWord = enResp.getWord();
                    }
                    mergedMeanings.addAll(enResp.getMeanings());

                    if (mergedMeanings.size() >= 12) break;
                }

                if (!mergedMeanings.isEmpty()) {
                    return WordLookupResponse.builder()
                            .word(displayWord)
                            .pronunciation(pronunciation)
                            .meanings(mergedMeanings)
                            .build();
                }
            }

            for (DictWord candidate : viCandidates) {
                WordLookupResponse response = buildResponse(candidate);
                if (response != null && !response.getMeanings().isEmpty()) {
                    return response;
                }
            }

            return null;
        }

        return lookupEnglish(normalized);
    }

    private WordLookupResponse lookupEnglish(String word) {
        if (word == null || word.isBlank()) return null;

        String normalized = Normalizer.normalize(word.trim(), Normalizer.Form.NFC);

        List<DictWord> candidates = wordRepo.findByWordAndLang(normalized, "en");
        if (candidates.isEmpty()) {
            candidates = wordRepo.findAllByWordIgnoreCase(normalized);
        }

        if (candidates.isEmpty()) return null;

        for (DictWord candidate : candidates) {
            WordLookupResponse response = buildResponse(candidate);
            if (response != null && !response.getMeanings().isEmpty()) {
                return response;
            }
        }

        return null;
    }

    private boolean containsVietnameseChars(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        return lower.matches(".*[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ].*");
    }

    private WordLookupResponse buildResponse(DictWord dictWord) {
        String pronunciation = null;
        if ("en".equalsIgnoreCase(dictWord.getLangCode())) {
            pronunciation = pronunciationRepo.findByWordId(dictWord.getId())
                    .stream()
                    .map(DictPronunciation::getIpa)
                    .filter(Objects::nonNull)
                    .filter(s -> !s.isBlank())
                    .findFirst()
                    .orElse(null);
        }

        Map<String, WordLookupResponse.WordLookupMeaning> meaningMap = new LinkedHashMap<>();

        if ("en".equalsIgnoreCase(dictWord.getLangCode())) {
            List<DictWordDefinition> wordDefs = wordDefRepo.findByWordId(dictWord.getId());

            for (DictWordDefinition wd : wordDefs) {
                Optional<DictDefinition> defOpt = definitionRepo.findById(wd.getDefinitionId());
                if (defOpt.isEmpty()) continue;

                DictDefinition def = defOpt.get();

                if (def.getDefinitionLang() == null
                        || !def.getDefinitionLang().equalsIgnoreCase("vi")) {
                    continue;
                }

                String posFull = mapPartOfSpeech(def.getPos());
                if (posFull == null || posFull.isBlank()) continue;

                String meaning = def.getDefinition();
                if (meaning == null) continue;

                meaning = meaning.trim();
                if (meaning.isEmpty()) continue;

                if (meaning.endsWith(".")) {
                    meaning = meaning.substring(0, meaning.length() - 1);
                }

                String example = wd.getExample();
                if (example != null) {
                    example = example.trim();
                    if (example.length() < 15) {
                        example = null;
                    }
                }

                String key = meaning.toLowerCase() + "|" + posFull;

                if (!meaningMap.containsKey(key)) {
                    meaningMap.put(key, WordLookupResponse.WordLookupMeaning.builder()
                            .partOfSpeech(posFull)
                            .meaning(meaning)
                            .example(example)
                            .build());
                }
            }
        } else {
            List<DictTranslation> translations = translationRepo.findByWordId(dictWord.getId());

            for (DictTranslation t : translations) {
                if (t.getTranslation() == null) continue;

                String meaning = t.getTranslation().trim();
                if (meaning.isEmpty()) continue;

                if (t.getLangCode() == null
                        || !t.getLangCode().equalsIgnoreCase("en")) {
                    continue;
                }

                String key = meaning.toLowerCase();

                if (!meaningMap.containsKey(key)) {
                    meaningMap.put(key, WordLookupResponse.WordLookupMeaning.builder()
                            .partOfSpeech("")
                            .meaning(meaning)
                            .example(null)
                            .build());
                }
            }
        }

        if (meaningMap.isEmpty()) return null;

        Map<String, Integer> posCount = new HashMap<>();
        Map<String, Integer> maxPerPos = new HashMap<>();
        maxPerPos.put("Danh từ", 4);
        maxPerPos.put("Động từ", 4);
        maxPerPos.put("Tính từ", 4);
        maxPerPos.put("Trạng từ", 3);

        List<WordLookupResponse.WordLookupMeaning> finalMeanings = new ArrayList<>();
        for (WordLookupResponse.WordLookupMeaning m : meaningMap.values()) {
            String pos = m.getPartOfSpeech();
            if (pos == null || pos.isBlank()) pos = "other";

            int currentCount = posCount.getOrDefault(pos, 0);
            int max = maxPerPos.getOrDefault(pos, 3);

            if (currentCount < max) {
                finalMeanings.add(m);
                posCount.put(pos, currentCount + 1);
            }

            if (finalMeanings.size() >= 12) break;
        }

        return WordLookupResponse.builder()
                .word(dictWord.getWord())
                .pronunciation(pronunciation)
                .meanings(finalMeanings)
                .build();
    }

    @Override
    public List<WordLookupResponse> search(String keyword, int limit) {
        if (keyword == null || keyword.isBlank()) return List.of();

        int safeLimit = Math.min(limit, 6);

        String normalized = Normalizer.normalize(keyword.trim(), Normalizer.Form.NFC);

        List<DictWord> words = wordRepo.searchByKeywordExact(
                normalized,
                PageRequest.of(0, safeLimit * 3)
        );

        List<WordLookupResponse> results = new ArrayList<>();
        Set<String> seenWords = new HashSet<>();

        for (DictWord w : words) {
            String wordKey = w.getWord().toLowerCase().trim();
            if (seenWords.contains(wordKey)) continue;

            WordLookupResponse lookup = lookup(w.getWord());
            if (lookup != null && !lookup.getMeanings().isEmpty()) {
                results.add(lookup);
                seenWords.add(wordKey);
            }

            if (results.size() >= safeLimit) break;
        }

        return results;
    }

    private String mapPartOfSpeech(String pos) {
        if (pos == null || pos.isBlank()) return null;

        return switch (pos.trim().toUpperCase()) {
            case "N", "NOUN" -> "Danh từ";
            case "V", "VERB" -> "Động từ";
            case "A", "ADJ", "ADJECTIVE" -> "Tính từ";
            case "ADV", "ADVERB" -> "Trạng từ";
            case "PRE", "PREPOSITION" -> "Giới từ";
            case "CONJ", "CONJUNCTION" -> "Liên từ";
            case "PRON", "PRONOUN" -> "Đại từ";
            case "NUM", "NUMERAL" -> "Số từ";
            case "ART", "ARTICLE" -> "Mạo từ";
            case "INT", "INTERJECTION" -> "Thán từ";
            default -> null;
        };
    }
}