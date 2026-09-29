package com.englishlearning.backend.enums;

public enum GrammarEditRequestStatus {
    PENDING,    // Teacher gửi, chờ admin duyệt
    APPROVED,   // Admin đồng ý → topic về DRAFT
    REJECTED    // Admin từ chối → topic vẫn PUBLISHED
}