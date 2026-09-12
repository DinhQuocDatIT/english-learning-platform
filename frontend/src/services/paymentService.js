import axiosClient from "../api/axiosClient";

const paymentService = {
  getPaymentHistory(params = {}) {
    const {
      status,
      keyword,
      fromDate,
      toDate,
      page = 0,
      size = 10,
      sortBy = "createdAt",
      direction = "desc",
    } = params;

    return axiosClient.get("/v1/payments/history", {
      params: {
        ...(status && { status }),
        ...(keyword && { keyword }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
        page,
        size,
        sortBy,
        direction,
      },
    });
  },

  getPaymentSummary() {
    return axiosClient.get("/v1/payments/summary");
  },
};

export default paymentService;
