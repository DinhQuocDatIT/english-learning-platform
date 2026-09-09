import axiosClient from "../api/axiosClient";

const listeningLessonService = {
  // ===== TEACHER =====
  create(data) {
    return axiosClient.post("/v1/listening-lessons", data);
  },

  update(id, data) {
    return axiosClient.put(`/v1/listening-lessons/${id}`, data);
  },

  getMyLessons() {
    return axiosClient.get("/v1/listening-lessons/my");
  },

  getMyLessonsByTopic(topicId) {
    return axiosClient.get(`/v1/listening-lessons/topic/${topicId}/my`);
  },

  submit(id) {
    return axiosClient.post(`/v1/listening-lessons/${id}/submit`);
  },

  // ===== TEACHER - HARD DELETE =====
  hardDelete(id) {
    return axiosClient.delete(`/v1/listening-lessons/${id}/hard`);
  },

  // ===== PUBLIC =====
  getById(id) {
    return axiosClient.get(`/v1/listening-lessons/${id}`);
  },

  getByTopic(topicId) {
    return axiosClient.get(`/v1/listening-lessons/topic/${topicId}`);
  },

  getPublishedByTopic(topicId) {
    return axiosClient.get(`/v1/listening-lessons/topic/${topicId}/published`);
  },

  // ===== ADMIN =====
  getAllForAdmin() {
    return axiosClient.get("/v1/listening-lessons/admin");
  },

  // ===== ADMIN - GET BY TOPIC (bao gồm cả bài đã ẩn) =====
  getByTopicForAdmin(topicId) {
    return axiosClient.get(`/v1/listening-lessons/admin/topic/${topicId}`);
  },

  approve(id) {
    return axiosClient.post(`/v1/listening-lessons/admin/${id}/approve`);
  },

  reject(id) {
    return axiosClient.post(`/v1/listening-lessons/admin/${id}/reject`);
  },

  publish(id) {
    return axiosClient.post(`/v1/listening-lessons/admin/${id}/publish`);
  },

  // ===== ADMIN - SOFT DELETE =====
  softDelete(id) {
    return axiosClient.delete(`/v1/listening-lessons/admin/${id}/soft`);
  },

  // ===== ADMIN - RESTORE =====
  restore(id) {
    return axiosClient.post(`/v1/listening-lessons/admin/${id}/restore`);
  },

  // ===== ADMIN - GET DELETED LESSONS =====
  getDeletedLessons() {
    return axiosClient.get("/v1/listening-lessons/admin/deleted");
  },
};

export default listeningLessonService;
