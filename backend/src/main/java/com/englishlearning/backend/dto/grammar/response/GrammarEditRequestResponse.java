package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarEditRequestResponse {

    private Long id;

    // Topic info
    private Long topicId;
    private String topicName;
    private String topicSlug;

    // Người gửi
    private Long requestedById;
    private String requestedByName;

    private String reason;

    // Trạng thái
    private String status;

    // Người duyệt
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String reviewNote;

    private LocalDateTime createdAt;

    // Tiện cho frontend
    private boolean hasPendingRequest;   // chỉ true khi status = PENDING
}