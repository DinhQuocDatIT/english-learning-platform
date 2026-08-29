import axiosClient from "../api/axiosClient";

const topicService = {
  create(data) {
    return axiosClient.post("/v1/topics", data);
  },

  update(id, data) {
    return axiosClient.put(`/v1/topics/${id}`, data);
  },

  getAll() {
    return axiosClient.get("/v1/topics/admin");
  },

  getPublishedTopics() {
    return axiosClient.get("/v1/topics");
  },

  getById(id) {
    return axiosClient.get(`/v1/topics/${id}`);
  },

  publish(id) {
    return axiosClient.post(`/v1/topics/admin/${id}/publish`);
  },

  hide(id) {
    return axiosClient.post(`/v1/topics/admin/${id}/hide`);
  },
  getTopicsForStudent: (params = {}) => {
    return axiosClient.get("/v1/topics/student", { params });
  },

  // Lấy chi tiết topic
  getById: (id) => {
    return axiosClient.get(`/v1/topics/${id}`);
  },

  // Lấy danh sách topic đã publish (cho teacher/student)
  getPublishedTopics: () => {
    return axiosClient.get("/v1/topics");
  },
};

export default topicService;
