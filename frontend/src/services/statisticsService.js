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
  getStudyActivities() {
    return axiosClient.get("/v1/admin/statistics/study-activities");
  },
  getOverview() {
    return axiosClient.get("/v1/admin/statistics/overview");
  },
};

export default statisticsService;
