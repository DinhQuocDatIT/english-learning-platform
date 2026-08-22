import axiosClient from "../api/axiosClient";

const studentMembershipService = {
  register(data) {
    return axiosClient.post("/v1/student-memberships", data);
  },

  getCurrentMembership() {
    return axiosClient.get("/v1/student-memberships/current");
  },
};

export default studentMembershipService;
