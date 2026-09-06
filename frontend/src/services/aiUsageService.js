import axiosClient from "../api/axiosClient";

const aiUsageService = {
  /**
   * Lấy thống kê AI Usage
   * @param {Object} params - { startDate, endDate }
   */
  getStats(params) {
    return axiosClient.get("/v1/admin/ai-usage/stats", { params });
  },

  /**
   * Lấy lịch sử AI Usage có phân trang
   * @param {Object} params - { page, size, sort }
   */
  getHistory(params) {
    return axiosClient.get("/v1/admin/ai-usage/history", { params });
  },

  /**
   * Lấy dashboard AI Usage (tổng quan + biểu đồ + top students)
   * @param {Object} params - { startDate, endDate, topLimit }
   */
  getDashboard(params) {
    return axiosClient.get("/v1/admin/ai-usage/dashboard", { params });
  },
};

export default aiUsageService;