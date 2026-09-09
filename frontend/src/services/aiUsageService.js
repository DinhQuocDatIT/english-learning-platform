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
  getOverview(params) {
    return axiosClient.get("/v1/admins/ai-usage/statistics/overview", {
      params,
    });
  },

  getTimeline(params) {
    return axiosClient.get("/v1/admins/ai-usage/statistics/timeline", {
      params,
    });
  },

  getByRequestType(params) {
    return axiosClient.get("/v1/admins/ai-usage/statistics/by-request-type", {
      params,
    });
  },

  getByModel(params) {
    return axiosClient.get("/v1/admins/ai-usage/statistics/by-model", {
      params,
    });
  },

  getCost(params) {
    return axiosClient.get("/v1/admins/ai-usage/statistics/cost", {
      params,
    });
  },

  getPerformance(params) {
    return axiosClient.get("/v1/admins/ai-usage/statistics/performance", {
      params,
    });
  },

  getTopStudents(params) {
    return axiosClient.get("/v1/admins/ai-usage/statistics/top-students", {
      params,
    });
  },
};

export default aiUsageService;
