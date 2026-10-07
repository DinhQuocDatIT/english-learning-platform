import axiosClient from "../api/axiosClient";

const studentVocabularyService = {
  saveVocabulary(data) {
    return axiosClient.post("/v1/student-vocabularies", data);
  },

  getAll() {
    return axiosClient.get("/v1/student-vocabularies");
  },
  getByStatus(status) {
    return axiosClient.get("/v1/student-vocabularies", {
      params: {
        status,
      },
    });
  },

  updateStatus(studentVocabularyId, status) {
    return axiosClient.patch(
      `/v1/student-vocabularies/${studentVocabularyId}/status`,
      {
        status,
      },
    );
  },
  delete(studentVocabularyId) {
    return axiosClient.delete(
      `/v1/student-vocabularies/${studentVocabularyId}`,
    );
  },
};

export default studentVocabularyService;
