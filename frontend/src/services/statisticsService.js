import axiosClient from "../api/axiosClient";

const statisticsService = {
  getRevenueTrend(params = {}) {
    const { fromDate, toDate, groupBy = "month" } = params;

    return axiosClient.get("/v1/admin/statistics/revenue-trend", {
      params: {
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
        groupBy,
      },
    });
  },
};

export default statisticsService;