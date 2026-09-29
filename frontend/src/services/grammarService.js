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
};

export default GrammarService;
