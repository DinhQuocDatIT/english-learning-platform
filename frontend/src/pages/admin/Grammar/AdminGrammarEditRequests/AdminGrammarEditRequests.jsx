import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheck,
  faTimes,
  faClock,
  faPen,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import GrammarEditRequestRejectForm from "../../../../components/GrammarEditRequestRejectForm/GrammarEditRequestRejectForm";
import styles from "./AdminGrammarEditRequests.module.css";

const STATUS_FILTERS = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "", label: "Tất cả" },
];

/**
 * Tách chuỗi lý do thành mảng.
 * - Ưu tiên dấu "|" (data mới)
 * - Fallback dấu "," (data cũ)
 */
function splitReasons(reason) {
  if (!reason) return [];
  const delimiter = reason.includes("|") ? "|" : ",";
  return reason
    .split(delimiter)
    .map((r) => r.trim())
    .filter(Boolean);
}

function AdminGrammarEditRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("PENDING");

  // Modal từ chối
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await grammarService.adminGetEditRequests(activeFilter);
      setRequests(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    if (
      !window.confirm(
        `Duyệt yêu cầu chỉnh sửa chủ điểm "${request.topicName}"?\n\nChủ điểm sẽ chuyển về trạng thái NHÁP để giáo viên sửa.`,
      )
    )
      return;

    try {
      await grammarService.adminApproveEditRequest(request.id);
      toast.success("Đã duyệt yêu cầu!");

      // ✅ Refresh badge sidebar
      window.dispatchEvent(new Event("refresh-edit-requests"));

      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể duyệt.");
    }
  };

  const handleOpenReject = (request) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (note) => {
    try {
      setRejecting(true);
      await grammarService.adminRejectEditRequest(selectedRequest.id, note);
      toast.success("Đã từ chối yêu cầu!");

      // ✅ Refresh badge sidebar
      window.dispatchEvent(new Event("refresh-edit-requests"));

      setRejectModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể từ chối.");
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Chờ duyệt",
          bg: "#fef3c7",
          color: "#d97706",
          border: "#fde68a",
        };
      case "APPROVED":
        return {
          label: "Đã duyệt",
          bg: "#dcfce7",
          color: "#16a34a",
          border: "#bbf7d0",
        };
      case "REJECTED":
        return {
          label: "Đã từ chối",
          bg: "#fef2f2",
          color: "#dc2626",
          border: "#fecaca",
        };
      default:
        return {
          label: status,
          bg: "#f1f5f9",
          color: "#64748b",
          border: "#cbd5e1",
        };
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Yêu cầu chỉnh sửa chủ điểm</h1>
          <p>Duyệt hoặc từ chối yêu cầu chỉnh sửa từ giáo viên</p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className={styles.filterTabs}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${
              activeFilter === f.value ? styles.filterBtnActive : ""
            }`}
            onClick={() => setActiveFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <div className={styles.loadingBox}>
          <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
        </div>
      ) : requests.length === 0 ? (
        <div className={styles.emptyBox}>
          <FontAwesomeIcon icon={faPen} className={styles.emptyIcon} />
          <p>
            {activeFilter === "PENDING"
              ? "Không có yêu cầu nào đang chờ duyệt."
              : "Không có yêu cầu nào."}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {requests.map((req) => {
            const statusCfg = getStatusBadge(req.status);
            const isPending = req.status === "PENDING";
            const reasons = splitReasons(req.reason);
            const reviewNotes = splitReasons(req.reviewNote);

            return (
              <div key={req.id} className={styles.card}>
                {/* HEADER */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        borderColor: statusCfg.border,
                      }}
                    >
                      {statusCfg.label}
                    </span>
                    <h3
                      className={styles.topicName}
                      onClick={() =>
                        navigate(
                          `/dashboard/admin/grammar/topics/${req.topicId}/theory`,
                        )
                      }
                      title="Xem chi tiết chủ điểm"
                    >
                      {req.topicName}
                    </h3>
                  </div>
                  {isPending && (
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => handleOpenReject(req)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        <span>Từ chối</span>
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        onClick={() => handleApprove(req)}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Duyệt</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* META */}
                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <FontAwesomeIcon icon={faUser} />
                    <strong>{req.requestedByName}</strong>
                  </span>
                  <span className={styles.metaItem}>
                    <FontAwesomeIcon icon={faClock} />
                    {formatDate(req.createdAt)}
                  </span>
                </div>

                {/* REASON */}
                <div className={styles.reasonBox}>
                  <span className={styles.reasonLabel}>
                    Lý do yêu cầu ({reasons.length})
                  </span>
                  <ul className={styles.reasonList}>
                    {reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* REVIEW INFO (nếu đã xử lý) */}
                {!isPending && req.reviewedByName && (
                  <div className={styles.reviewBox}>
                    <span className={styles.reviewLabel}>
                      {req.status === "APPROVED" ? "Đã duyệt" : "Đã từ chối"}{" "}
                      bởi <strong>{req.reviewedByName}</strong>
                      {req.reviewedAt && ` lúc ${formatDate(req.reviewedAt)}`}
                    </span>

                    {reviewNotes.length > 0 && (
                      <div className={styles.reviewNoteBox}>
                        <span className={styles.reviewNoteLabel}>Ghi chú</span>
                        <ul className={styles.reviewNoteList}>
                          {reviewNotes.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REJECT MODAL */}
      <GrammarEditRequestRejectForm
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleConfirmReject}
        isLoading={rejecting}
        title="Từ chối yêu cầu chỉnh sửa"
      />
    </div>
  );
}

export default AdminGrammarEditRequests;
