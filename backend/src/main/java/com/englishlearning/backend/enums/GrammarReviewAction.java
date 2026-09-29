package com.englishlearning.backend.enums;


public enum GrammarReviewAction {
    SUBMIT,          // Teacher gửi duyệt topic
    APPROVE,         // Admin publish topic
    REJECT,          // Admin từ chối publish topic
    UNPUBLISH,       // Admin ẩn topic
    RESTORE,         // Admin bỏ ẩn topic
    REQUEST_EDIT,    // Teacher gửi yêu cầu chỉnh sửa
    APPROVE_EDIT,    // Admin đồng ý cho sửa
    REJECT_EDIT      // Admin từ chối yêu cầu sửa
}