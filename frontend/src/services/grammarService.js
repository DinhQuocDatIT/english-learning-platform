import axiosClient from "../api/axiosClient";

const GrammarService = {
  // =====================================================
  // PUBLIC (Student xem)
  // =====================================================
  getAllRoadmaps() {
    return axiosClient.get("/v1/grammar/roadmaps");
  },

  getRoadmapDetail(roadmapId) {
    return axiosClient.get(`/v1/grammar/roadmaps/${roadmapId}`);
  },
  getPublishedExamples(topicId) {
    return axiosClient.get(`/v1/grammar/topics/${topicId}/examples`);
  },
  getTopicDetail(topicId) {
    return axiosClient.get(`/v1/grammar/topics/${topicId}`);
  },
  getPublishedTips(topicId) {
    return axiosClient.get(`/v1/grammar/topics/${topicId}/tips`);
  },

  // =====================================================
  // QUIZ — PUBLIC + STUDENT
  // =====================================================
  getPublishedQuizzes(topicId) {
    return axiosClient.get(`/v1/grammar/topics/${topicId}/quizzes`);
  },
  getQuizForPlay(quizId) {
    return axiosClient.get(`/v1/student/grammar/quizzes/${quizId}`);
  },
  startOrResumeQuizAttempt(quizId) {
    return axiosClient.post(`/v1/student/grammar/quizzes/${quizId}/start`);
  },
  getQuizAttempt(quizId) {
    return axiosClient.get(`/v1/student/grammar/quizzes/${quizId}/attempt`);
  },
  saveQuizAnswer(attemptId, questionId, answer) {
    return axiosClient.put(`/v1/student/grammar/attempts/${attemptId}/answer`, {
      questionId,
      answer,
    });
  },
  submitQuizAttempt(attemptId) {
    return axiosClient.post(`/v1/student/grammar/attempts/${attemptId}/submit`);
  },
  getQuizAttemptById(attemptId) {
    return axiosClient.get(`/v1/student/grammar/attempts/${attemptId}`);
  },
  // =====================================================
  // QUIZ — PUBLIC + STUDENT
  // =====================================================
  getPublishedQuizzes(topicId) {
    return axiosClient.get(`/v1/grammar/topics/${topicId}/quizzes`);
  },

  getQuizForPlay(quizId) {
    return axiosClient.get(`/v1/student/grammar/quizzes/${quizId}`);
  },

  startOrResumeQuizAttempt(quizId) {
    return axiosClient.post(`/v1/student/grammar/quizzes/${quizId}/start`);
  },

  getQuizAttempt(quizId) {
    return axiosClient.get(`/v1/student/grammar/quizzes/${quizId}/attempt`);
  },

  saveQuizAnswer(attemptId, questionId, answer) {
    return axiosClient.put(`/v1/student/grammar/attempts/${attemptId}/answer`, {
      questionId,
      answer,
    });
  },

  submitQuizAttempt(attemptId) {
    return axiosClient.post(`/v1/student/grammar/attempts/${attemptId}/submit`);
  },

  getQuizAttemptById(attemptId) {
    return axiosClient.get(`/v1/student/grammar/attempts/${attemptId}`);
  },
  // =====================================================
  // TEACHER — ROADMAP
  // =====================================================
  getRoadmapsForTeacher() {
    return axiosClient.get("/v1/teacher/grammar/roadmaps");
  },

  // =====================================================
  // TEACHER — TOPIC
  // =====================================================
  getMyTopics(roadmapId) {
    const params = roadmapId ? { roadmapId } : {};
    return axiosClient.get("/v1/teacher/grammar/topics", { params });
  },

  getTopicForEdit(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}`);
  },

  createTopic(data) {
    return axiosClient.post("/v1/teacher/grammar/topics", data);
  },

  updateTopic(topicId, data) {
    return axiosClient.put(`/v1/teacher/grammar/topics/${topicId}`, data);
  },

  deleteTopic(topicId) {
    return axiosClient.delete(`/v1/teacher/grammar/topics/${topicId}`);
  },

  submitTopicForReview(topicId) {
    return axiosClient.post(`/v1/teacher/grammar/topics/${topicId}/submit`);
  },

  // Teacher xem lịch sử duyệt topic của mình
  teacherGetTopicHistory(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}/history`);
  },

  // =====================================================
  // TEACHER — THEORY
  // =====================================================
  getTheories(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}/theories`);
  },

  createTheory(data) {
    return axiosClient.post("/v1/teacher/grammar/theories", data);
  },

  createTheoriesBatch(topicId, data) {
    return axiosClient.post(
      `/v1/teacher/grammar/topics/${topicId}/theories/batch`,
      data,
    );
  },

  updateTheory(theoryId, data) {
    return axiosClient.put(`/v1/teacher/grammar/theories/${theoryId}`, data);
  },

  deleteTheory(theoryId) {
    return axiosClient.delete(`/v1/teacher/grammar/theories/${theoryId}`);
  },

  // =====================================================
  // TEACHER — EDIT REQUEST (MỚI)
  // =====================================================
  requestEditTopic(topicId, reason) {
    return axiosClient.post(
      `/v1/teacher/grammar/topics/${topicId}/request-edit`,
      { reason },
    );
  },

  getMyEditRequests(topicId) {
    return axiosClient.get(
      `/v1/teacher/grammar/topics/${topicId}/edit-requests`,
    );
  },
  // =====================================================
  // TEACHER — EXAMPLE
  // =====================================================
  getExamples(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}/examples`);
  },
  createExample(data) {
    return axiosClient.post("/v1/teacher/grammar/examples", data);
  },
  updateExample(exampleId, data) {
    return axiosClient.put(`/v1/teacher/grammar/examples/${exampleId}`, data);
  },
  deleteExample(exampleId) {
    return axiosClient.delete(`/v1/teacher/grammar/examples/${exampleId}`);
  },
  // =====================================================
  // TEACHER — TIP
  // =====================================================
  getTips(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}/tips`);
  },
  createTip(data) {
    return axiosClient.post("/v1/teacher/grammar/tips", data);
  },
  updateTip(tipId, data) {
    return axiosClient.put(`/v1/teacher/grammar/tips/${tipId}`, data);
  },
  deleteTip(tipId) {
    return axiosClient.delete(`/v1/teacher/grammar/tips/${tipId}`);
  },
  // =====================================================
  // TEACHER — QUIZ
  // =====================================================
  getQuizzes(topicId) {
    return axiosClient.get(`/v1/teacher/grammar/topics/${topicId}/quizzes`);
  },
  getQuiz(quizId) {
    return axiosClient.get(`/v1/teacher/grammar/quizzes/${quizId}`);
  },
  createQuiz(data) {
    return axiosClient.post("/v1/teacher/grammar/quizzes", data);
  },
  updateQuiz(quizId, data) {
    return axiosClient.put(`/v1/teacher/grammar/quizzes/${quizId}`, data);
  },
  deleteQuiz(quizId) {
    return axiosClient.delete(`/v1/teacher/grammar/quizzes/${quizId}`);
  },

  // =====================================================
  // ADMIN — ROADMAP
  // =====================================================
  adminGetAllRoadmaps() {
    return axiosClient.get("/v1/admin/grammar/roadmaps");
  },

  adminGetRoadmapById(id) {
    return axiosClient.get(`/v1/admin/grammar/roadmaps/${id}`);
  },

  adminCreateRoadmap(data) {
    return axiosClient.post("/v1/admin/grammar/roadmaps", data);
  },

  adminUpdateRoadmap(id, data) {
    return axiosClient.put(`/v1/admin/grammar/roadmaps/${id}`, data);
  },

  adminDeleteRoadmap(id) {
    return axiosClient.delete(`/v1/admin/grammar/roadmaps/${id}`);
  },

  // =====================================================
  // ADMIN — TOPIC
  // =====================================================
  adminGetTopicsByRoadmap(roadmapId) {
    return axiosClient.get(`/v1/admin/grammar/roadmaps/${roadmapId}/topics`);
  },

  adminGetTopicById(topicId) {
    return axiosClient.get(`/v1/admin/grammar/topics/${topicId}`);
  },

  adminPublishTopic(topicId) {
    return axiosClient.post(`/v1/admin/grammar/topics/${topicId}/publish`);
  },

  adminUnpublishTopic(topicId) {
    return axiosClient.post(`/v1/admin/grammar/topics/${topicId}/unpublish`);
  },

  adminRejectTopic(topicId, reason) {
    return axiosClient.post(`/v1/admin/grammar/topics/${topicId}/reject`, {
      reason,
    });
  },

  adminGetTopicHistory(topicId) {
    return axiosClient.get(`/v1/admin/grammar/topics/${topicId}/history`);
  },
  adminGetExamples(topicId) {
    return axiosClient.get(`/v1/admin/grammar/topics/${topicId}/examples`);
  },
  adminGetTips(topicId) {
    return axiosClient.get(`/v1/admin/grammar/topics/${topicId}/tips`);
  },

  // =====================================================
  // ADMIN — QUIZ (readonly)
  // =====================================================
  adminGetQuizzes(topicId) {
    return axiosClient.get(`/v1/admin/grammar/topics/${topicId}/quizzes`);
  },
  adminGetQuizDetail(quizId) {
    return axiosClient.get(`/v1/admin/grammar/quizzes/${quizId}`);
  },
  // =====================================================
  // ADMIN — EDIT REQUEST (MỚI)
  // =====================================================
  adminGetEditRequests(status) {
    const params = status ? { status } : {};
    return axiosClient.get("/v1/admin/grammar/edit-requests", { params });
  },

  adminCountPendingEditRequests() {
    return axiosClient.get("/v1/admin/grammar/edit-requests/count-pending");
  },

  adminApproveEditRequest(requestId) {
    return axiosClient.post(
      `/v1/admin/grammar/edit-requests/${requestId}/approve`,
    );
  },

  adminRejectEditRequest(requestId, note) {
    return axiosClient.post(
      `/v1/admin/grammar/edit-requests/${requestId}/reject`,
      { note },
    );
  },
  adminRestoreTopic(topicId) {
    return axiosClient.post(`/v1/admin/grammar/topics/${topicId}/restore`);
  },
};

export default GrammarService;
