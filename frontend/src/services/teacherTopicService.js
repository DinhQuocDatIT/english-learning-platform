import axiosClient from "../api/axiosClient";

const teacherTopicService = {
  getTopics() {
    return axiosClient.get("/v1/topics/teacher");
  },

  getById(id) {
    return axiosClient.get(`/v1/topics/${id}`);
  },

  getListeningLessons(topicId) {
    return axiosClient.get(`/v1/listening-lessons/topic/${topicId}`);
  },
};

export default teacherTopicService;
