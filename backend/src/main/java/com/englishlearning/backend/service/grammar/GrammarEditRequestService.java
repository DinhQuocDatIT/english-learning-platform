package com.englishlearning.backend.service.grammar;

import com.englishlearning.backend.dto.grammar.response.GrammarEditRequestResponse;

import java.util.List;

public interface GrammarEditRequestService {

    // =====================================================
    // TEACHER
    // =====================================================

    /** Teacher gửi yêu cầu chỉnh sửa topic */
    GrammarEditRequestResponse createRequest(Long teacherId, Long topicId, String reason);

    /** Xem lịch sử yêu cầu của 1 topic (teacher sở hữu) */
    List<GrammarEditRequestResponse> getRequestsByTopicForTeacher(
            Long teacherId, Long topicId);

    /** Kiểm tra topic có yêu cầu PENDING không */
    boolean hasPendingRequest(Long topicId);

    // =====================================================
    // ADMIN
    // =====================================================

    /** Danh sách yêu cầu theo status (null = tất cả) */
    List<GrammarEditRequestResponse> getAllRequests(String status);

    /** Đếm số yêu cầu PENDING (cho badge sidebar) */
    long countPending();

    /** Admin duyệt yêu cầu → topic về DRAFT */
    GrammarEditRequestResponse approveRequest(Long adminId, Long requestId);

    /** Admin từ chối yêu cầu */
    GrammarEditRequestResponse rejectRequest(Long adminId, Long requestId, String note);
}