import axiosClient from "../api/axiosClient";

const practiceService = {
  /**
   * 1. Tạo practice chat mới
   * @param {Object} data - { level, sentenceType, topic, questionLimit, vocabularyWords }
   */
  createPractice(data) {
    return axiosClient.post("/v1/ai/practice", data);
  },

  /**
   * 2. Submit câu trả lời
   * @param {Number} chatId - ID của practice chat
   * @param {Object} data - { turnId, studentAnswer }
   */
  submitAnswer(chatId, data) {
    return axiosClient.post(`/v1/ai/practice/${chatId}/answer`, data);
  },

  /**
   * 3. Lấy lịch sử practice
   */
  getPracticeHistory() {
    return axiosClient.get("/v1/ai/practice/history");
  },

  /**
   * 4. Lấy kết quả practice đã hoàn thành
   * @param {Number} chatId - ID của practice chat
   */
  getPracticeResult(chatId) {
    return axiosClient.get(`/v1/ai/practice/${chatId}/result`);
  },

  /**
   * 5. Lấy thông tin chi tiết practice chat
   * @param {Number} chatId - ID của practice chat
   */
  getPracticeChat(chatId) {
    return axiosClient.get(`/v1/ai/practice/${chatId}`);
  },
};

export default practiceService;