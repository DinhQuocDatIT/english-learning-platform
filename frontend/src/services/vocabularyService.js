import axiosClient from "../api/axiosClient";

const vocabularyService = {
  lookup(word, options = {}) {
    return axiosClient.get("/v1/dictionary/lookup", {
      params: { word },
      ...options,
    });
  },

  search(keyword, limit = 10, options = {}) {
    return axiosClient.get("/v1/dictionary/search", {
      params: { keyword, limit },
      ...options,
    });
  },
};

export default vocabularyService;
