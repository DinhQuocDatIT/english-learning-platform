import axiosClient from "../api/axiosClient";

const listeningLessonService = {
  create(data) {
    return axiosClient.post("/v1/listening-lessons", data);
  },

  update(id, data) {
    return axiosClient.put(`/v1/listening-lessons/${id}`, data);
  },

  getMyLessons() {
    return axiosClient.get("/v1/listening-lessons/my");
  },

  getById(id) {
    return axiosClient.get(`/v1/listening-lessons/${id}`);
  },

  getByTopic(topicId) {
    return axiosClient.get(`/v1/listening-lessons/topic/${topicId}`);
  },

  submit(id) {
    return axiosClient.post(`/v1/listening-lessons/${id}/submit`);
  },
  getMyLessonsByTopic(topicId) {
    return axiosClient.get(`/v1/listening-lessons/topic/${topicId}/my`);
  },
};

export default listeningLessonService;
