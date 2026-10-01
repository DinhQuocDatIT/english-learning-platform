import axiosClient from "../api/axiosClient";

const leaderboardService = {
  getLeaderboard(limit = 100) {
    return axiosClient.get("/v1/leaderboard", {
      params: {
        limit,
      },
    });
  },
};

export default leaderboardService;
