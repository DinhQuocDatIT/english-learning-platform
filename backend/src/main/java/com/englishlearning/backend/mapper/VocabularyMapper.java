package com.englishlearning.backend.mapper;


import com.englishlearning.backend.dto.request.VocabularyRequest;
import com.englishlearning.backend.dto.response.VocabularyMeaningResponse;
import com.englishlearning.backend.dto.response.VocabularyResponse;
import com.englishlearning.backend.entity.Vocabulary;
import com.englishlearning.backend.entity.VocabularyMeaning;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Component
public class VocabularyMapper {


    public Vocabulary toEntity(
            VocabularyRequest request
    ){

        Vocabulary vocabulary = new Vocabulary();
        vocabulary.setWord(request.getWord());
        vocabulary.setPronunciation(
                request.getPronunciation()
        );
        List<VocabularyMeaning> meanings =
                request.getMeanings()
                        .stream()
                        .map(item -> {


                            VocabularyMeaning meaning =
                                    new VocabularyMeaning();


                            meaning.setPartOfSpeech(
                                    item.getPartOfSpeech()
                            );


                            meaning.setMeaning(
                                    item.getMeaning()
                            );


                            meaning.setExample(
                                    item.getExample()
                            );


                            meaning.setVocabulary(
                                    vocabulary
                            );


                            return meaning;

                        })
                        .toList();



        vocabulary.setMeanings(
                new ArrayList<>(meanings)
        );


        return vocabulary;

    }





    public void updateEntity(
            Vocabulary vocabulary,
            VocabularyRequest request
    ){

        vocabulary.setWord(
                request.getWord()
        );


        vocabulary.setPronunciation(
                request.getPronunciation()
        );



        // xóa nghĩa cũ
        vocabulary.getMeanings()
                .clear();



        // thêm nghĩa mới

        request.getMeanings()
                .forEach(item -> {


                    VocabularyMeaning meaning =
                            new VocabularyMeaning();



                    meaning.setPartOfSpeech(
                            item.getPartOfSpeech()
                    );


                    meaning.setMeaning(
                            item.getMeaning()
                    );


                    meaning.setExample(
                            item.getExample()
                    );


                    meaning.setVocabulary(
                            vocabulary
                    );



                    vocabulary.getMeanings()
                            .add(meaning);

                });

    }






    public VocabularyResponse toResponse(
            Vocabulary vocabulary
    ){

        return VocabularyResponse.builder()

                .id(vocabulary.getId())

                .word(
                        vocabulary.getWord()
                )

                .pronunciation(
                        vocabulary.getPronunciation()
                )


                .meanings(
                        vocabulary.getMeanings()
                                .stream()
                                .map(item ->
                                        VocabularyMeaningResponse.builder()

                                                .partOfSpeech(
                                                        item.getPartOfSpeech()
                                                )

                                                .meaning(
                                                        item.getMeaning()
                                                )

                                                .example(
                                                        item.getExample()
                                                )

                                                .build()
                                )
                                .toList()
                )


                .build();

    }

}