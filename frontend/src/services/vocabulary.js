import axiosClient from "../api/axiosClient";

const vocabulary = {
  addVocabulary(data) {
    return axiosClient.post("/v1/vocabularies", data);
  },
  getAllByPage(page = 1, size = 10) {
    return axiosClient.get("/v1/vocabularies", {
      params: {
        page,
        size,
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
