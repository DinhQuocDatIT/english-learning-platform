import axiosClient from "../api/axiosClient";

const teacherService = {
  getTeachers(page = 1, size = 10, keyword = "") {
    return axiosClient.get("/v1/admins/teachers", {
      params: {
        page,
        size,
        keyword,
      },
    });
  },
  createTeacher(data) {
    return axiosClient.post("/v1/admins/teachers", data);
  },
  getTeacherById(id) {
    return axiosClient.get(`/v1/admins/teachers/${id}`);
  },
  updateTeacher(id, data) {
    return axiosClient.put(`/v1/admins/teachers/${id}`, data);
  },
  changeTeacherPassword(id, data) {
    return axiosClient.put(`/v1/admins/teachers/${id}/change-password`, data);
  },
  deactivateTeacher(id) {
    return axiosClient.put(`/v1/admins/user/${id}/deactivate`);
  },
  activateTeacher: (id) => {
    return axiosClient.put(`/v1/admins/user/${id}/activate`);
  },
};

export default teacherService;
