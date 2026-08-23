import axiosClient from "../api/axiosClient";

const levelService = {
  getAll() {
    return axiosClient.get("/v1/levels");
  },

  getById(id) {
    return axiosClient.get(`/v1/levels/${id}`);
  },

  create(data) {
    return axiosClient.post("/v1/levels", data);
  },

  update(id, data) {
    return axiosClient.put(`/v1/levels/${id}`, data);
  },

  lock(id) {
    return axiosClient.post(`/v1/levels/${id}/lock`);
  },

  unlock(id) {
    return axiosClient.post(`/v1/levels/${id}/unlock`);
  },
};

export default levelService;
