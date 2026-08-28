import axiosClient from "../api/axiosClient";

const listeningLessonReviewService = {
  getByLesson(lessonId) {
    return axiosClient.get(`/v1/listening-lesson-reviews/lesson/${lessonId}`);
  },
  create(data) {
    return axiosClient.post("/v1/listening-lesson-reviews", data);
  },

  getAll() {
    return axiosClient.get("/v1/listening-lesson-reviews");
  },
  getById(id) {
    return axiosClient.get(`/v1/listening-lesson-reviews/${id}`);
  },
  delete(id) {
    return axiosClient.delete(`/v1/listening-lesson-reviews/${id}`);
  },
};

export default listeningLessonReviewService;
