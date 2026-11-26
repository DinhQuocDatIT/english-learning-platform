package com.englishlearning.backend.dto.grammar.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopicResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Integer displayOrder;
    private String status;

    private Long roadmapId;
    private String roadmapName;
    // ===== THÔNG TIN OWNER =====
    private Long createdById;
    private String createdByName;

    /** true nếu user đang login là người tạo topic này */
    private Boolean isOwner;

    /**
     * true nếu isOwner && status == PUBLISHED && không có edit request PENDING.
     * Frontend dùng để hiện nút "Gửi yêu cầu chỉnh sửa".
     */
    private Boolean canRequestEdit;
}