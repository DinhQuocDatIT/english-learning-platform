import axiosClient from "../api/axiosClient";

const studentService = {
  getStudents(page = 1, size = 10, keyword = "") {
    return axiosClient.get("/v1/students", {
      params: {
        page,
        size,
        keyword,
      },
    });
  },

  createStudent(data) {
    return axiosClient.post("/v1/students/create", data);
  },

  getStudentByUserId(userId) {
    return axiosClient.get(`/v1/students/${userId}`);
  },

  updateStudentByUserId(userId, data) {
    return axiosClient.put(`/v1/students/${userId}`, data);
  },

  deactivateStudent(id) {
    return axiosClient.put(`/v1/admins/user/${id}/deactivate`);
  },

  activateStudent(id) {
    return axiosClient.put(`/v1/admins/user/${id}/activate`);
  },
};

export default studentService;
