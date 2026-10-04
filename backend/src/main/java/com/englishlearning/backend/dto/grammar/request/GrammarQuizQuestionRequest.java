package com.englishlearning.backend.dto.grammar.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarQuizQuestionRequest {

    private Long id;   // null nếu câu mới, có id nếu sửa câu cũ

    @NotBlank(message = "Câu hỏi không được để trống")
    private String question;

    @NotNull(message = "Đáp án không được để trống")
    @Size(min = 4, max = 4, message = "Phải có đúng 4 đáp án")
    private List<String> options;

    @NotBlank(message = "Đáp án đúng không được để trống")
    private String correctAnswer;

    private String explanation;

    private Integer displayOrder;
    private Map<String, String> optionExplanations;
}