import axiosClient from "../api/axiosClient";

const membershipPackageService = {
  getActivePackages() {
    return axiosClient.get("/v1/membership-packages/active");
  },
  getAll() {
    return axiosClient.get("/v1/membership-packages");
  },

  getById(id) {
    return axiosClient.get(`/v1/membership-packages/${id}`);
  },

  create(data) {
    return axiosClient.post("/v1/membership-packages", data);
  },

  update(id, data) {
    return axiosClient.put(`/v1/membership-packages/${id}`, data);
  },

  delete(id) {
    return axiosClient.delete(`/v1/membership-packages/${id}`);
  },

  deactivate(id) {
    return axiosClient.put(`/v1/membership-packages/${id}/deactivate`);
  },

  activate(id) {
    return axiosClient.put(`/v1/membership-packages/${id}/activate`);
  },
};

export default membershipPackageService;
