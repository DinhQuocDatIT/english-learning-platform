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

  uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/v1/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  removeAvatar() {
    return axiosClient.delete("/v1/users/me/avatar");
  },
};

export default UserService;
