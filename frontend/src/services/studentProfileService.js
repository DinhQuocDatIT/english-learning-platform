import axiosClient from "../api/axiosClient";

const studentProfileService = {
  getMyProfile() {
    return axiosClient.get("/v1/student-profile/me");
  },

  // Cập nhật thông tin
  updateProfile(data) {
    return axiosClient.put("/v1/users/me", data);
  },

  // Đổi mật khẩu
  changePassword(data) {
    return axiosClient.put("/v1/users/me/change-password", data);
  },
};

export default studentProfileService;
