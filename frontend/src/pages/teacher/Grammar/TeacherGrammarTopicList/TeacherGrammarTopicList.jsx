import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faSpinner,
  faEdit,
  faTrash,
  faPaperPlane,
  faBookOpen,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import {
  getStatusLabel,
  getStatusColor,
} from "../../../../constants/grammarConstants";
import styles from "./TeacherGrammarTopicList.module.css";

function TeacherGrammarTopicList() {
  const navigate = useNavigate();
  const { roadmapId } = useParams();

  const [roadmap, setRoadmap] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [roadmapId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roadmapRes, topicsRes] = await Promise.all([
        grammarService.getRoadmapDetail(roadmapId),
        grammarService.getMyTopics(roadmapId),
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

  const handleDelete = async (topic) => {
    if (!window.confirm(`Xóa chủ điểm "${topic.name}"?`)) return;
    try {
      await grammarService.deleteTopic(topic.id);
      toast.success("Xóa thành công!");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể xóa.");
    }
  };

  const handleSubmit = async (topic) => {
    if (!window.confirm(`Gửi duyệt chủ điểm "${topic.name}"?`)) return;
    try {
      await grammarService.submitTopicForReview(topic.id);
      toast.success("Đã gửi duyệt!");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể gửi duyệt.");
    }
  };

  const renderTopic = (topic, index) => {
    const statusColor = getStatusColor(topic.status);
    const canEdit = topic.status === "DRAFT" || topic.status === "REJECTED";

    // Ưu tiên displayOrder, fallback về index + 1
    const orderNumber =
      topic.displayOrder != null ? topic.displayOrder : index + 1;

    return (
      <div
        key={topic.id}
        className={styles.row}
        style={{ "--topic-color": roadmap?.color || "#0ea792" }}
      >
        {/* STT — lấy từ displayOrder */}
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
          <button
            className={`${styles.actionBtn} ${styles.primaryBtn}`}
            onClick={() =>
              navigate(`/dashboard/teacher/grammar/topics/${topic.id}/theories`)
            }
            title="Quản lý lý thuyết"
          >
            <FontAwesomeIcon icon={faBookOpen} />
            <span>Lý thuyết</span>
          </button>

          {canEdit && (
            <>
              <button
                className={styles.actionBtn}
                onClick={() =>
                  navigate(
                    `/dashboard/teacher/grammar/roadmaps/${roadmapId}/topics/${topic.id}/edit`,
                  )
                }
                title="Sửa"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>

              <button
                className={`${styles.actionBtn} ${styles.dangerBtn}`}
                onClick={() => handleDelete(topic)}
                title="Xóa"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>

              <button
                className={`${styles.actionBtn} ${styles.submitBtn}`}
                onClick={() => handleSubmit(topic)}
                title="Gửi duyệt"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </>
          )}
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
    <div className={styles.container}>
      {/* BACK */}
      <button
        className={styles.backBtn}
        onClick={() => navigate("/dashboard/teacher/grammar")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

      {/* HEADER */}
      <div
        className={styles.header}
        style={{ "--topic-color": roadmap?.color || "#0ea792" }}
      >
        <div className={styles.headerLeft}>
          <span className={styles.levelLabel}>
            <FontAwesomeIcon icon={faLayerGroup} />
            {roadmap?.levelLabel || "Lộ trình"}
          </span>
          <h1 style={{ color: roadmap?.color || "#0ea792" }}>
            {roadmap?.name}
          </h1>
        </div>
        <button
          className={styles.createBtn}
          onClick={() =>
            navigate(
              `/dashboard/teacher/grammar/roadmaps/${roadmapId}/topics/create`,
            )
          }
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm chủ điểm</span>
        </button>
      </div>

      {/* LIST */}
      {topics.length === 0 ? (
        <div className={styles.emptyBox}>
          <FontAwesomeIcon icon={faBookOpen} className={styles.emptyIcon} />
          <p>Chưa có chủ điểm nào. Bắt đầu bằng cách tạo chủ điểm mới.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {topics.map((t, i) => renderTopic(t, i))}
        </div>
      )}
    </div>
  );
}

export default TeacherGrammarTopicList;
