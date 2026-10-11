import axiosClient from "../api/axiosClient";

const conversationService = {
  /**
   * 1. Tạo cuộc hội thoại mới
   * @param {Object} data - { level, topic }
   * level: BEGINNER | INTERMEDIATE | ADVANCED
   * topic: DAILY_CONVERSATION | RESTAURANT | JOB_INTERVIEW | TRAVEL | MAKING_FRIENDS
   */
  createConversation(data) {
    return axiosClient.post("/v1/ai/conversation", data);
  },

  /**
   * 2. Gửi tin nhắn
   * @param {Number} conversationId
   * @param {Object} data - { message }
   */
  sendMessage(conversationId, data) {
    return axiosClient.post(
      `/v1/ai/conversation/${conversationId}/message`,
      data,
    );
  },

  /**
   * 3. Lấy chi tiết cuộc hội thoại (kèm toàn bộ messages)
   * @param {Number} conversationId
   */
  getConversation(conversationId) {
    return axiosClient.get(`/v1/ai/conversation/${conversationId}`);
  },

  /**
   * 4. Lấy lịch sử cuộc hội thoại (phân trang)
   * @param {Number} page
   * @param {Number} size
   */
  getConversationHistory(page = 0, size = 10) {
    return axiosClient.get("/v1/ai/conversation/history", {
      params: { page, size },
    });
  },

  /**
   * 5. Kết thúc cuộc hội thoại
   * @param {Number} conversationId
   */
  endConversation(conversationId) {
    return axiosClient.post(`/v1/ai/conversation/${conversationId}/end`);
  },

  /**
   * 6. Lấy tin nhắn phân trang
   * @param {Number} conversationId
   * @param {Number} page
   * @param {Number} size
   */
  getMessages(conversationId, page = 0, size = 20) {
    return axiosClient.get(`/v1/ai/conversation/${conversationId}/messages`, {
      params: { page, size },
    });
  },
};

export default conversationService;
