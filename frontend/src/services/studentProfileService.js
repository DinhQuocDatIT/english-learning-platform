import axiosClient from "../api/axiosClient";

const studentProfileService = {
  // Level info
  getLevel() {
    return axiosClient.get("/v1/student-profile/me/level");
  },

  // Stats tổng hợp
  getStats() {
    return axiosClient.get("/v1/student-profile/me/stats");
  },

  // Membership
  getMembership() {
    return axiosClient.get("/v1/student-profile/me/membership");
  },

  // Weaknesses
  getWeaknesses() {
    return axiosClient.get("/v1/student-profile/me/weaknesses");
  },

  // Vocabulary
  getVocabulary() {
    return axiosClient.get("/v1/student-profile/me/vocabulary");
  },

  // Weekly activity
  getWeeklyActivity() {
    return axiosClient.get("/v1/student-profile/me/weekly-activity");
  },
};

export default studentProfileService;
