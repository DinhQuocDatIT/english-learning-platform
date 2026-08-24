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
};

export default topicService;
