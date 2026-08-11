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
};

export default teacherService;
