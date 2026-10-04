package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarQuizSummaryResponse {

    private Long id;
    private Long topicId;
    private String title;
    private String description;
    private Integer displayOrder;
    private String status;
    private Integer totalQuestions;

    // ===== Thông tin attempt của student hiện tại (nếu có) =====
    private Boolean hasInProgressAttempt;  // đang làm dở
    private Integer attemptCount;          // số lần đã làm xong
    private Integer bestScore;             // điểm cao nhất (null nếu chưa làm)
    private Integer latestScore;           // điểm lần gần nhất
}