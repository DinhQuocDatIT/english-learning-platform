import axiosClient from "../api/axiosClient";

const dictWordService = {
  list(page = 0, size = 10, keyword = "") {
    return axiosClient.get("/v1/dict-words", {
      params: { page, size, keyword },
    });
  },

  getDetail(id) {
    return axiosClient.get(`/v1/dict-words/${id}`);
  },
};

export default dictWordService;
