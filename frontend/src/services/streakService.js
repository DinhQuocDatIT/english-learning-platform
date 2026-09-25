import axiosClient from "../api/axiosClient";

const streakService = {
  getMyStreak() {
    return axiosClient.get("/v1/streaks/me");
  },
};

export default streakService;