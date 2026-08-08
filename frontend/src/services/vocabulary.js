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
};
export default vocabulary;
