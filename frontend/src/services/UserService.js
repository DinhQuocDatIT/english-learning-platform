import axiosClient from "../api/axiosClient";
const UserService = {
  getProfile() {
    return axiosClient.get("/v1/users/me");
  },
  updateProfile(data) {
    return axiosClient.put("/v1/users/me", data);
  },
  changePassword(data) {
    return axiosClient.put("/v1/users/me/change-password", data);
  },
};
export default UserService;
