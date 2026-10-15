import axiosClient from "../api/axiosClient";

const conversationService = {
  /**
   * 1. Tạo cuộc hội thoại mới
   * @param {Object} data - { level }
   * level: BEGINNER | INTERMEDIATE | ADVANCED
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
   */
  getConversationHistory(page = 0, size = 10) {
    return axiosClient.get("/v1/ai/conversation/history", {
      params: { page, size },
    });
  },

  /**
   * 5. Kết thúc cuộc hội thoại
   */
  endConversation(conversationId) {
    return axiosClient.post(`/v1/ai/conversation/${conversationId}/end`);
  },

  /**
   * 6. Lấy tin nhắn phân trang
   */
  getMessages(conversationId, page = 0, size = 20) {
    return axiosClient.get(`/v1/ai/conversation/${conversationId}/messages`, {
      params: { page, size },
    });
  },
};

export default conversationService;
