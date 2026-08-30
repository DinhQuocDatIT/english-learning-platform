import axiosClient from "../api/axiosClient";

const listeningAnswerService = {
  // Trả lời câu hỏi
  answer: (data) => {
    return axiosClient.post("/v1/listening-answers/answer", data);
  },

  // Lấy lịch sử trả lời của tôi
  getMyAnswers: () => {
    return axiosClient.get("/v1/listening-answers/my-answers");
  },

  // Lấy lịch sử trả lời theo bài học
  getMyAnswersByLesson: (lessonId) => {
    return axiosClient.get(
      `/v1/listening-answers/my-answers/lesson/${lessonId}`,
    );
  },

  // Lấy câu trả lời theo câu hỏi
  getBySentence: (sentenceId) => {
    return axiosClient.get(`/v1/listening-answers/sentence/${sentenceId}`);
  },

  // Kiểm tra đã hoàn thành câu chưa
  isCompleted: (sentenceId) => {
    return axiosClient.get(
      `/v1/listening-answers/sentence/${sentenceId}/completed`,
    );
  },

  // Reset tất cả answers trong lesson
  resetLessonAnswers: (lessonId) => {
    return axiosClient.post(`/v1/listening-answers/reset/lesson/${lessonId}`);
  },

  // Lấy tiến độ bài học (đã hoàn thành chưa, số câu đã làm)
  getLessonProgress: (lessonId) => {
    return axiosClient.get(`/v1/listening-answers/lesson/${lessonId}/completed`);
  },
};

export default listeningAnswerService;