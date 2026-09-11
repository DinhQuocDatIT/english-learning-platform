import axiosClient from "../api/axiosClient";

const studentStatisticsService = {
  /**
   * Lấy toàn bộ thống kê
   */
  getMyStatistics() {
    return axiosClient.get("/v1/student-statistics/me");
  },

  /**
   * Lấy thống kê nhanh
   */
  getMyQuickStats() {
    return axiosClient.get("/v1/student-statistics/me/quick");
  },
};

export default studentStatisticsService;
