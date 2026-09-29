import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPaperPlane,
  faCheck,
  faXmark,
  faEyeSlash,
  faClock,
  faUser,
  faPen,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import grammarService from "../../services/grammarService";
import styles from "./GrammarTopicReviewHistory.module.css";

const ACTION_CONFIG = {
  SUBMIT: {
    label: "Gửi duyệt",
    icon: faPaperPlane,
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  APPROVE: {
    label: "Đã publish",
    icon: faCheck,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  REJECT: {
    label: "Từ chối chủ điểm",
    icon: faXmark,
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  UNPUBLISH: {
    label: "Đã ẩn",
    icon: faEyeSlash,
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  REQUEST_EDIT: {
    label: "Yêu cầu chỉnh sửa",
    icon: faPen,
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  APPROVE_EDIT: {
    label: "Đồng ý cho sửa",
    icon: faCircleCheck,
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
  REJECT_EDIT: {
    label: "Từ chối yêu cầu sửa",
    icon: faCircleXmark,
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

              <div
                className={styles.iconWrap}
                style={{
                  background: cfg.bg,
                  color: cfg.color,
                  borderColor: cfg.border,
                }}
              >
                <FontAwesomeIcon icon={cfg.icon} />
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span
                    className={styles.actionBadge}
                    style={{
                      background: cfg.bg,
                      color: cfg.color,
                      borderColor: cfg.border,
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
                  <div
                    className={`${styles.reasonBox} ${
                      h.action === "REQUEST_EDIT"
                        ? styles.reasonBoxRequestEdit
                        : ""
                    }`}
                    style={{
                      "--reason-color": cfg.color,
                      "--reason-bg": cfg.bg,
                      "--reason-border": cfg.border,
                    }}
                  >
                    <span className={styles.reasonLabel}>
                      {cfg.label} ({reasons.length})
                    </span>
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
