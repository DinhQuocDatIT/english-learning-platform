import axiosClient from "../api/axiosClient";

const vocabulary = {
  addVocabulary(data) {
    return axiosClient.post("/v1/vocabularies", data);
  },
  getVocabularyById(id) {
    return axiosClient.get(`/v1/vocabularies/${id}`);
  },
  updateVocabulary(id, data) {
    return axiosClient.put(`/v1/vocabularies/${id}`, data);
  },

  deleteVocabulary(id) {
    return axiosClient.delete(`/v1/vocabularies/${id}`);
  },
  restoreVocabulary(id) {
    return axiosClient.patch(`/v1/vocabularies/${id}/restore`);
  },
  getAllByPage(page = 1, size = 10, keyword = "", status = "ALL") {
    return axiosClient.get("/v1/vocabularies", {
      params: {
        page,
        size,
        keyword,
        status,
      },
    });
  },
  importCsv(file) {
    const formData = new FormData();

    formData.append("file", file);

    return axiosClient.post("/v1/vocabularies/import", formData);
  },
};
export default vocabulary;
