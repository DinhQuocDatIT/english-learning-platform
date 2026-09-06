
import axiosClient from "../api/axiosClient";

const pricingService = {
  /**
   * Lấy tất cả pricing
   */
  getAll() {
    return axiosClient.get("/v1/admin/pricing");
  },

  /**
   * Lấy pricing active
   */
  getActive() {
    return axiosClient.get("/v1/admin/pricing/active");
  },

  /**
   * Lấy pricing theo id
   */
  getById(id) {
    return axiosClient.get(`/v1/admin/pricing/${id}`);
  },

  /**
   * Tạo pricing mới
   */
  create(data) {
    return axiosClient.post("/v1/admin/pricing", data);
  },

  /**
   * Cập nhật pricing
   */
  update(id, data) {
    return axiosClient.put(`/v1/admin/pricing/${id}`, data);
  },

  /**
   * Vô hiệu hóa pricing
   */
  deactivate(id) {
    return axiosClient.delete(`/v1/admin/pricing/${id}`);
  },
};

export default pricingService;