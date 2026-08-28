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

  approve(id) {
    return axiosClient.post(`/v1/listening-lessons/admin/${id}/approve`);
  },

  reject(id) {
    return axiosClient.post(`/v1/listening-lessons/admin/${id}/reject`);
  },

  publish(id) {
    return axiosClient.post(`/v1/listening-lessons/admin/${id}/publish`);
  },
};

export default listeningLessonService;
