import axiosClient from "../api/axiosClient";

const authService = {
  login(data) {
    return axiosClient.post("/v1/auth/login", data);
  },

  register(data) {
    return axiosClient.post("/v1/auth/register", data);
  },

  getProfile() {
    return axiosClient.get("/v1/auth/me");
  },
  register(data) {
    return axiosClient.post("/v1/auth/student-register", data);
  },
};

export default authService;
