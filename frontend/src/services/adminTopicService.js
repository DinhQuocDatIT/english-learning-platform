
import axiosClient from "../api/axiosClient";

const adminTopicService = {
  getById(id) {
    return axiosClient.get(`/v1/topics/${id}`);
  },
};

export default adminTopicService;
