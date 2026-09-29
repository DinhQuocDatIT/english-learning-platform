import axiosClient from "../api/axiosClient";

const GrammarService = {
  // =====================================================
  // PUBLIC (Student xem)
  // =====================================================
  getAllRoadmaps() {
    return axiosClient.get("/v1/grammar/roadmaps");
  },

  getRoadmapDetail(roadmapId) {
    return axiosClient.get(`/v1/grammar/roadmaps/${roadmapId}`);
  },

  getTopicDetail(topicId) {
    return axiosClient.get(`/v1/grammar/topics/${topicId}`);
  },

  // =====================================================
  // TEACHER — ROADMAP
  // =====================================================
  getRoadmapsForTeacher() {
    return axiosClient.get("/v1/teacher/grammar/roadmaps");
  },

  // =====================================================
  // TEACHER — TOPIC
  // =====================================================
  getMyTopics(roadmapId) {
    const params = roadmapId ? { roadmapId } : {};
    return axiosClient.get("/v1/teacher/grammar/topics", { params });
  },

  getTopicForEdit(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}`);
  },

  createTopic(data) {
    return axiosClient.post("/v1/teacher/grammar/topics", data);
  },

  updateTopic(topicId, data) {
    return axiosClient.put(`/v1/teacher/grammar/topics/${topicId}`, data);
  },

  deleteTopic(topicId) {
    return axiosClient.delete(`/v1/teacher/grammar/topics/${topicId}`);
  },

  submitTopicForReview(topicId) {
    return axiosClient.post(`/v1/teacher/grammar/topics/${topicId}/submit`);
  },

  // Teacher xem lịch sử duyệt topic của mình
  teacherGetTopicHistory(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}/history`);
  },

  // =====================================================
  // TEACHER — THEORY
  // =====================================================
  getTheories(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}/theories`);
  },

  createTheory(data) {
    return axiosClient.post("/v1/teacher/grammar/theories", data);
  },

  createTheoriesBatch(topicId, data) {
    return axiosClient.post(
      `/v1/teacher/grammar/topics/${topicId}/theories/batch`,
      data,
    );
  },

  updateTheory(theoryId, data) {
    return axiosClient.put(`/v1/teacher/grammar/theories/${theoryId}`, data);
  },

  deleteTheory(theoryId) {
    return axiosClient.delete(`/v1/teacher/grammar/theories/${theoryId}`);
  },

  // =====================================================
  // TEACHER — EDIT REQUEST (MỚI)
  // =====================================================
  requestEditTopic(topicId, reason) {
    return axiosClient.post(
      `/v1/teacher/grammar/topics/${topicId}/request-edit`,
      { reason },
    );
  },

  getMyEditRequests(topicId) {
    return axiosClient.get(
      `/v1/teacher/grammar/topics/${topicId}/edit-requests`,
    );
  },

  // =====================================================
  // ADMIN — ROADMAP
  // =====================================================
  adminGetAllRoadmaps() {
    return axiosClient.get("/v1/admin/grammar/roadmaps");
  },

  adminGetRoadmapById(id) {
    return axiosClient.get(`/v1/admin/grammar/roadmaps/${id}`);
  },

  adminCreateRoadmap(data) {
    return axiosClient.post("/v1/admin/grammar/roadmaps", data);
  },

  adminUpdateRoadmap(id, data) {
    return axiosClient.put(`/v1/admin/grammar/roadmaps/${id}`, data);
  },

  adminDeleteRoadmap(id) {
    return axiosClient.delete(`/v1/admin/grammar/roadmaps/${id}`);
  },

  // =====================================================
  // ADMIN — TOPIC
  // =====================================================
  adminGetTopicsByRoadmap(roadmapId) {
    return axiosClient.get(`/v1/admin/grammar/roadmaps/${roadmapId}/topics`);
  },

  adminGetTopicById(topicId) {
    return axiosClient.get(`/v1/admin/grammar/topics/${topicId}`);
  },

  adminPublishTopic(topicId) {
    return axiosClient.post(`/v1/admin/grammar/topics/${topicId}/publish`);
  },

  adminUnpublishTopic(topicId) {
    return axiosClient.post(`/v1/admin/grammar/topics/${topicId}/unpublish`);
  },

  adminRejectTopic(topicId, reason) {
    return axiosClient.post(`/v1/admin/grammar/topics/${topicId}/reject`, {
      reason,
    });
  },

  adminGetTopicHistory(topicId) {
    return axiosClient.get(`/v1/admin/grammar/topics/${topicId}/history`);
  },

  // =====================================================
  // ADMIN — EDIT REQUEST (MỚI)
  // =====================================================
  adminGetEditRequests(status) {
    const params = status ? { status } : {};
    return axiosClient.get("/v1/admin/grammar/edit-requests", { params });
  },

  adminCountPendingEditRequests() {
    return axiosClient.get("/v1/admin/grammar/edit-requests/count-pending");
  },

  adminApproveEditRequest(requestId) {
    return axiosClient.post(
      `/v1/admin/grammar/edit-requests/${requestId}/approve`,
    );
  },

  adminRejectEditRequest(requestId, note) {
    return axiosClient.post(
      `/v1/admin/grammar/edit-requests/${requestId}/reject`,
      { note },
    );
  },
  adminRestoreTopic(topicId) {
    return axiosClient.post(`/v1/admin/grammar/topics/${topicId}/restore`);
  },
};

export default GrammarService;
