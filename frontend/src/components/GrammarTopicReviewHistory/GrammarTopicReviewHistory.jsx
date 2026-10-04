import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPaperPlane,
  faCheck,
  faXmark,
  faClock,
  faUser,
  faPen,
  faCloudArrowUp, // SUBMIT
  faRocket, // APPROVE (publish)
  faBan, // REJECT
  faEyeSlash, // UNPUBLISH
  faPenToSquare, // REQUEST_EDIT
  faCircleCheck, // APPROVE_EDIT
  faCircleXmark, // REJECT_EDIT
} from "@fortawesome/free-solid-svg-icons";
import grammarService from "../../services/grammarService";
import styles from "./GrammarTopicReviewHistory.module.css";

const ACTION_CONFIG = {
  SUBMIT: {
    label: "Gửi duyệt",
    icon: faCloudArrowUp, // ⬆️ gửi lên duyệt — trực quan hơn paper-plane
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  APPROVE: {
    label: "Đã publish",
    icon: faRocket, // 🚀 publish = phóng — hợp nghĩa "đã công khai"
    color: "#1fce5f",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  REJECT: {
    label: "Từ chối chủ điểm",
    icon: faBan, // 🚫 cấm — mạnh hơn dấu X
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  UNPUBLISH: {
    label: "Đã ẩn",
    icon: faEyeSlash, // 👁️‍🗨️ ẩn — giữ nguyên, đúng nghĩa
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  REQUEST_EDIT: {
    label: "Yêu cầu chỉnh sửa",
    icon: faPenToSquare, // ✏️ sửa trong khung — rõ "chỉnh sửa" hơn cây bút đơn
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  APPROVE_EDIT: {
    label: "Đồng ý cho sửa",
    icon: faCircleCheck, // ✅ giữ nguyên — đúng nghĩa "đồng ý"
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
  REJECT_EDIT: {
    label: "Từ chối yêu cầu sửa",
    icon: faCircleXmark, // ❌ giữ nguyên — đúng nghĩa "từ chối"
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
  },
};

function splitReasons(reason) {
  if (!reason) return [];
  const delimiter = reason.includes("|") ? "|" : ",";
  return reason
    .split(delimiter)
    .map((r) => r.trim())
    .filter(Boolean);
}

function GrammarTopicReviewHistory({ topicId, role = "admin" }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) fetchHistory();
  }, [topicId, role]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res =
        role === "admin"
          ? await grammarService.adminGetTopicHistory(topicId)
          : await grammarService.teacherGetTopicHistory(topicId);
      setHistory(res?.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <div className={styles.emptyIconWrap}>
          <FontAwesomeIcon icon={faClock} className={styles.emptyIcon} />
        </div>
        <p>Chưa có lịch sử duyệt cho chủ điểm này.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.timeline}>
        {history.map((h, idx) => {
          const cfg = ACTION_CONFIG[h.action] || ACTION_CONFIG.SUBMIT;
          const isLast = idx === history.length - 1;
          const reasons = splitReasons(h.reason);

          return (
            <div key={h.id} className={styles.item}>
              {!isLast && <div className={styles.line} />}

              <div className={styles.iconWrap}>
                <FontAwesomeIcon icon={cfg.icon} />
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span
                    className={styles.actionBadge}
                    style={{
                      color: cfg.color,
                    }}
                  >
                    {cfg.label}
                  </span>

                  <span className={styles.time}>
                    <FontAwesomeIcon icon={faClock} />
                    {new Date(h.performedAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className={styles.by}>
                  <FontAwesomeIcon icon={faUser} className={styles.byIcon} />
                  <span className={styles.byLabel}>Thực hiện bởi</span>
                  <strong>{h.performedByName}</strong>
                </div>

                {reasons.length > 0 && (
                  <div className={styles.reasonBox}>
                    <ul className={styles.reasonList}>
                      {reasons.map((r, i) => (
                        <li key={i} className={styles.reasonItem}>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GrammarTopicReviewHistory;
