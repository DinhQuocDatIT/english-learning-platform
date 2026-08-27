import axiosClient from "../api/axiosClient";

const listeningSentenceService = {
  getByLesson(lessonId) {
    return axiosClient.get(`/v1/listening-sentences/lesson/${lessonId}`);
  },

  getById(id) {
    return axiosClient.get(`/v1/listening-sentences/${id}`);
  },

  create(data) {
    return axiosClient.post("/v1/listening-sentences", data);
  },

  update(id, data) {
    return axiosClient.put(`/v1/listening-sentences/${id}`, data);
  },

  delete(id) {
    return axiosClient.delete(`/v1/listening-sentences/${id}`);
  },

  reorder(lessonId, sentenceIds) {
    return axiosClient.post(
      `/v1/listening-sentences/reorder/${lessonId}`,
      sentenceIds,
    );
  },
};

export default listeningSentenceService;
