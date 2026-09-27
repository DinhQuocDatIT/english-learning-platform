package com.englishlearning.backend.enums;

public enum GrammarStatus {
    DRAFT,        // Nháp — giáo viên đang soạn, học sinh không thấy
    PENDING,      // Chờ duyệt — giáo viên gửi admin duyệt
    PUBLISHED,    // Đã publish — học sinh thấy
    REJECTED,     // Bị từ chối — admin từ chối
    HIDDEN        // Bị ẩn — admin ẩn
}