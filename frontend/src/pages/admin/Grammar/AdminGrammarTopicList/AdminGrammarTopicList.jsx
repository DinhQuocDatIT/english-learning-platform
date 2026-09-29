import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faBookOpen,
  faLayerGroup,
  faEye,
  faCheck,
  faEyeSlash,
  faFilter,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import {
  getStatusLabel,
  getStatusColor,
} from "../../../../constants/grammarConstants";
import styles from "./AdminGrammarTopicList.module.css";

const STATUS_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "PUBLISHED", label: "Đã publish" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "HIDDEN", label: "Đã ẩn" },
];

function AdminGrammarTopicList() {
  const navigate = useNavigate();
  const { roadmapId } = useParams();

  const [roadmap, setRoadmap] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, [roadmapId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roadmapRes, topicsRes] = await Promise.all([
        grammarService.adminGetRoadmapById(roadmapId),
        grammarService.adminGetTopicsByRoadmap(roadmapId),
      ]);

      setRoadmap(roadmapRes?.data?.data || null);
      setTopics(topicsRes?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách chủ điểm.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (topic) => {
    if (
      !window.confirm(
        `Publish chủ điểm "${topic.name}"?\n\nTất cả lý thuyết trong chủ điểm cũng sẽ được publish.`,
      )
    )
      return;

    try {
      await grammarService.adminPublishTopic(topic.id);
      toast.success("Publish chủ điểm thành công!");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể publish.");
    }
  };

  const handleUnpublish = async (topic) => {
    if (!window.confirm(`Ẩn chủ điểm "${topic.name}"?`)) return;
    try {
      await grammarService.adminUnpublishTopic(topic.id);
      toast.success("Đã ẩn chủ điểm!");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể ẩn.");
    }
  };

  // ✅ Bỏ ẩn — đưa topic về PUBLISHED
  const handleRestore = async (topic) => {
    if (!window.confirm(`Bỏ ẩn chủ điểm "${topic.name}"?`)) return;
    try {
      await grammarService.adminRestoreTopic(topic.id);
      toast.success("Đã bỏ ẩn chủ điểm!");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể bỏ ẩn.");
    }
  };

  const countByStatus = (status) => {
    if (status === "ALL") return topics.length;
    return topics.filter((t) => t.status === status).length;
  };

  const filteredTopics =
    activeFilter === "ALL"
      ? topics
      : topics.filter((t) => t.status === activeFilter);

  const renderTopic = (topic, index) => {
    const statusColor = getStatusColor(topic.status);
    const isPublished = topic.status === "PUBLISHED";
    const isPending = topic.status === "PENDING";
    const isRejected = topic.status === "REJECTED";
    const isHidden = topic.status === "HIDDEN";

    const orderNumber =
      topic.displayOrder != null ? topic.displayOrder : index + 1;

    return (
      <div
        key={topic.id}
        className={styles.row}
        style={{ "--topic-color": roadmap?.color || "#0ea792" }}
      >
        {/* STT */}
        <span className={styles.orderBadge}>{orderNumber}</span>

        {/* ICON */}
        <span className={styles.iconBox}>
          <FontAwesomeIcon icon={faBookOpen} />
        </span>

        {/* INFO */}
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name} title={topic.name}>
              {topic.name}
            </span>
            <span
              className={styles.statusBadge}
              style={{
                background: statusColor.bg,
                color: statusColor.color,
                borderColor: statusColor.border,
              }}
            >
              {getStatusLabel(topic.status)}
            </span>
          </div>
          <div className={styles.metaRow}>
            <code className={styles.slug}>{topic.slug}</code>
          </div>
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          {(isPending || isRejected) && (
            <button
              className={`${styles.actionBtn} ${styles.publishBtn}`}
              onClick={() => handlePublish(topic)}
              title="Publish chủ điểm"
            >
              <FontAwesomeIcon icon={faCheck} />
              <span>Publish</span>
            </button>
          )}

          {isPublished && (
            <button
              className={`${styles.actionBtn} ${styles.hideBtn}`}
              onClick={() => handleUnpublish(topic)}
              title="Ẩn chủ điểm"
            >
              <FontAwesomeIcon icon={faEyeSlash} />
              <span>Ẩn</span>
            </button>
          )}

          {/* ✅ Nút Bỏ ẩn — chỉ hiện khi topic HIDDEN */}
          {isHidden && (
            <button
              className={`${styles.actionBtn} ${styles.restoreBtn}`}
              onClick={() => handleRestore(topic)}
              title="Bỏ ẩn chủ điểm"
            >
              <FontAwesomeIcon icon={faRotateLeft} />
              <span>Bỏ ẩn</span>
            </button>
          )}

          <button
            className={styles.actionBtn}
            onClick={() =>
              navigate(`/dashboard/admin/grammar/topics/${topic.id}/theory`, {
                state: { roadmapId },
              })
            }
            title="Xem chi tiết"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      style={{ "--topic-color": roadmap?.color || "#0ea792" }}
    >
      {/* BACK */}
      <button
        className={styles.backBtn}
        onClick={() => navigate("/dashboard/admin/grammar")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>{roadmap?.name}</h1>
        <span className={styles.levelLabel}>
          <FontAwesomeIcon icon={faLayerGroup} />
          {roadmap?.levelLabel || "Lộ trình"}
        </span>
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
            <span>{f.label}</span>
            <span className={styles.filterCount}>{countByStatus(f.value)}</span>
          </button>
        ))}
      </div>

      {/* LIST */}
      {filteredTopics.length === 0 ? (
        <div className={styles.emptyBox}>
          <FontAwesomeIcon icon={faFilter} className={styles.emptyIcon} />
          <p>
            {activeFilter === "ALL"
              ? "Chưa có chủ điểm nào."
              : `Không có chủ điểm nào ở trạng thái "${getStatusLabel(activeFilter)}".`}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredTopics.map((t, i) => renderTopic(t, i))}
        </div>
      )}
    </div>
  );
}

export default AdminGrammarTopicList;
