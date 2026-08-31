// src/services/listeningSentenceFeedbackService.js
import axiosClient from "../api/axiosClient";

const listeningSentenceFeedbackService = {
  create: (data) => {
    return axiosClient.post("/v1/listening-sentence-feedbacks", data);
  },

  update: (feedbackId, data) => {
    return axiosClient.put(
      `/v1/listening-sentence-feedbacks/${feedbackId}`,
      data,
    );
  },

  delete: (feedbackId) => {
    return axiosClient.delete(`/v1/listening-sentence-feedbacks/${feedbackId}`);
  },

  getMyFeedbackBySentence: (sentenceId) => {
    return axiosClient.get(
      `/v1/listening-sentence-feedbacks/sentence/${sentenceId}/my`,
    );
  },

  getMyFeedbacks: () => {
    return axiosClient.get("/v1/listening-sentence-feedbacks/my");
  },

  getMyFeedbacksByLesson: (lessonId) => {
    return axiosClient.get(
      `/v1/listening-sentence-feedbacks/my/lesson/${lessonId}`,
    );
  },


  getBySentence: (sentenceId) => {
    return axiosClient.get(
      `/v1/listening-sentence-feedbacks/sentence/${sentenceId}`,
    );
  },

  getByLesson: (lessonId) => {
    return axiosClient.get(
      `/v1/listening-sentence-feedbacks/lesson/${lessonId}`,
    );
  },
};

export default listeningSentenceFeedbackService;
