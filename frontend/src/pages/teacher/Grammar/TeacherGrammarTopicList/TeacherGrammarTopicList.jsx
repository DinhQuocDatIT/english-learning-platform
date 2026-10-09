import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faEdit,
  faTrash,
  faPaperPlane,
  faBookOpen,
  faLayerGroup,
  faPen,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import {
  getStatusLabel,
  getStatusColor,
} from "../../../../constants/grammarConstants";
import GrammarEditRequestModal from "../../../../components/GrammarEditRequestModal/GrammarEditRequestModal";
import Loading from "../../../../components/common/Loading/Loading";
import styles from "./TeacherGrammarTopicList.module.css";

function TeacherGrammarTopicList() {
  const navigate = useNavigate();
  const { roadmapId } = useParams();

  const [roadmap, setRoadmap] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [selectedTopicForEdit, setSelectedTopicForEdit] = useState(null);

  const [pendingRequestTopics, setPendingRequestTopics] = useState({});

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

      const roadmapData = roadmapRes?.data?.data || null;
      const topicsData = topicsRes?.data?.data || [];

      setRoadmap(roadmapData);
      setTopics(topicsData);

      await checkPendingRequests(topicsData);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách chủ điểm.");
    } finally {
      setLoading(false);
    }
  };

  const checkPendingRequests = async (topicsList) => {
    const publishedTopics = topicsList.filter((t) => t.status === "PUBLISHED");
    if (publishedTopics.length === 0) return;

    const results = {};
    await Promise.all(
      publishedTopics.map(async (t) => {
        try {
          const res = await grammarService.getMyEditRequests(t.id);
          const requests = res?.data?.data || [];
          const hasPending = requests.some((r) => r.status === "PENDING");
          if (hasPending) results[t.id] = true;
        } catch (e) {
          // bỏ qua lỗi từng topic
        }
      }),
    );
    setPendingRequestTopics(results);
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

  const handleOpenEditRequest = (topic) => {
    setSelectedTopicForEdit(topic);
    setEditModalOpen(true);
  };

  const handleSubmitEditRequest = async (reason) => {
    try {
      setSubmittingRequest(true);
      await grammarService.requestEditTopic(selectedTopicForEdit.id, reason);
      toast.success("Đã gửi yêu cầu chỉnh sửa!");

      window.dispatchEvent(new Event("refresh-edit-requests"));

      setEditModalOpen(false);
      setPendingRequestTopics((prev) => ({
        ...prev,
        [selectedTopicForEdit.id]: true,
      }));
      setSelectedTopicForEdit(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể gửi yêu cầu.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const renderTopic = (topic, index) => {
    const statusColor = getStatusColor(topic.status);
    const canEdit = topic.status === "DRAFT" || topic.status === "REJECTED";
    const isPublished = topic.status === "PUBLISHED";
    const hasPendingRequest = pendingRequestTopics[topic.id];

    const orderNumber =
      topic.displayOrder != null ? topic.displayOrder : index + 1;

    return (
      <div
        key={topic.id}
        className={styles.row}
        style={{ "--topic-color": roadmap?.color || "#0ea792" }}
      >
        <span className={styles.orderBadge}>{orderNumber}</span>

        <span className={styles.iconBox}>
          <FontAwesomeIcon icon={faBookOpen} />
        </span>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name} title={topic.name}>
              {topic.name}
            </span>
          </div>
          <div className={styles.metaRow}>
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

            {isPublished && hasPendingRequest && (
              <span className={styles.pendingRequestBadge}>
                <FontAwesomeIcon icon={faClock} />
                Chờ duyệt yêu cầu
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.primaryBtn}`}
            onClick={() =>
              navigate(`/dashboard/teacher/grammar/topics/${topic.id}/theory`)
            }
            title="Quản lý nội dung"
          >
            <FontAwesomeIcon icon={faBookOpen} />
            <span>Nội dung</span>
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

          {isPublished && !hasPendingRequest && (
            <button
              className={`${styles.actionBtn} ${styles.requestEditBtn}`}
              onClick={() => handleOpenEditRequest(topic)}
              title="Yêu cầu chỉnh sửa"
            >
              <FontAwesomeIcon icon={faPen} />
              <span>Yêu cầu sửa</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // ===== LOADING =====
  if (loading) {
    return <Loading size="large" text="Đang tải danh sách chủ điểm..." />;
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backBtn}
        onClick={() => navigate("/dashboard/teacher/grammar")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

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

      <GrammarEditRequestModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTopicForEdit(null);
        }}
        onSubmit={handleSubmitEditRequest}
        isLoading={submittingRequest}
        topicName={selectedTopicForEdit?.name}
      />
    </div>
  );
}

export default TeacherGrammarTopicList;
