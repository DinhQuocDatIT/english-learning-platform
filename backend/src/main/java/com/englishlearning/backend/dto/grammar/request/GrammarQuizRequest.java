package com.englishlearning.backend.dto.grammar.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarQuizRequest {

    @NotNull(message = "TopicId không được để trống")
    private Long topicId;

    @NotBlank(message = "Tiêu đề đề không được để trống")
    private String title;

    private String description;

    private Integer displayOrder;

    // Danh sách câu hỏi — khi sửa, gửi lên full list (BE xoá hết rồi tạo lại)
    @Builder.Default
    private List<GrammarQuizQuestionRequest> questions = new ArrayList<>();
}