import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faBookOpen,
  faLightbulb,
  faStar,
  faQuestionCircle,
  faCheck,
  faXmark,
  faClock,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import {
  getStatusLabel,
  getStatusColor,
} from "../../../../constants/grammarConstants";
import GrammarRejectForm from "../../../../components/GrammarRejectForm/GrammarRejectForm";
import styles from "./AdminGrammarTopicLayout.module.css";

// 5 tab cho Admin duyệt
const TABS = [
  { key: "theory", path: "theory", label: "Lý thuyết", icon: faBookOpen },
  { key: "example", path: "examples", label: "Ví dụ", icon: faStar },
  { key: "tip", path: "tips", label: "Mẹo", icon: faLightbulb },
  { key: "quiz", path: "quiz", label: "Trắc nghiệm", icon: faQuestionCircle },
  { key: "history", path: "history", label: "Lịch sử duyệt", icon: faHistory },
];

function AdminGrammarTopicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { topicId } = useParams();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const res = await grammarService.adminGetTopicById(topicId);
      setTopic(res?.data?.data || null);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải chủ điểm.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // Xác định tab đang active từ URL
  const currentPath = location.pathname.split("/").pop();
  const activeTab = TABS.find((t) => t.path === currentPath)?.key || "theory";
  const activeTabObj = TABS.find((t) => t.key === activeTab) || TABS[0];

  const handleTabChange = (tab) => {
    navigate(`/dashboard/admin/grammar/topics/${topicId}/${tab.path}`, {
      state: { roadmapId: topic?.roadmapId || location.state?.roadmapId },
    });
  };

  // Quay về danh sách chủ điểm của roadmap
  const handleBack = () => {
    const rid =
      topic?.roadmapId ||
      location.state?.roadmapId ||
      localStorage.getItem("lastRoadmapId");

    if (rid) {
      navigate(`/dashboard/admin/grammar/roadmaps/${rid}/topics`);
    } else {
      navigate("/dashboard/admin/grammar");
    }
  };

  const handlePublish = async () => {
    if (
      !window.confirm(
        `Publish chủ điểm "${topic?.name}"?\n\nTất cả nội dung (lý thuyết, mẹo, ví dụ, trắc nghiệm) sẽ được publish cho học sinh xem.`,
      )
    )
      return;

    try {
      setPublishing(true);
      await grammarService.adminPublishTopic(topicId);
      toast.success("Publish chủ điểm thành công!");
      fetchTopic();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể publish.");
    } finally {
      setPublishing(false);
    }
  };

  // ===== REJECT =====
  const handleOpenReject = () => {
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (reason) => {
    try {
      setRejecting(true);
      await grammarService.adminRejectTopic(topicId, reason);
      toast.success("Đã từ chối chủ điểm!");
      setRejectModalOpen(false);
      fetchTopic();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể từ chối.");
    } finally {
      setRejecting(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm(`Ẩn chủ điểm "${topic?.name}"?`)) return;
    try {
      await grammarService.adminUnpublishTopic(topicId);
      toast.success("Đã ẩn chủ điểm!");
      fetchTopic();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể ẩn.");
    }
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

  const isPending = topic?.status === "PENDING";
  const isPublished = topic?.status === "PUBLISHED";
  const isDraft = topic?.status === "DRAFT";
  const isRejected = topic?.status === "REJECTED";
  const statusColor = topic ? getStatusColor(topic.status) : null;

  return (
    <div className={styles.container}>
      {/* BACK — luôn về trang danh sách chủ điểm của roadmap */}
      <button className={styles.backBtn} onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{topic?.name}</h1>
          <div className={styles.metaRow}>
            {topic?.status && (
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
            )}
          </div>
        </div>

        <div className={styles.headerActions}>
          {isPending && (
            <>
              <button
                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                onClick={handleOpenReject}
              >
                <FontAwesomeIcon icon={faXmark} />
                <span>Từ chối</span>
              </button>
              <button
                className={`${styles.actionBtn} ${styles.publishBtn}`}
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faCheck} />
                )}
                <span>Publish</span>
              </button>
            </>
          )}

          {isPublished && (
            <button
              className={`${styles.actionBtn} ${styles.unpublishBtn}`}
              onClick={handleUnpublish}
            >
              <FontAwesomeIcon icon={faXmark} />
              <span>Ẩn chủ điểm</span>
            </button>
          )}

          {(isDraft || isRejected) && (
            <span className={styles.disabledHint}>
              Chủ điểm này chưa được gửi duyệt
            </span>
          )}
        </div>
      </div>

      {/* INFO BANNER */}
      {isPending && (
        <div className={styles.infoBanner}>
          <FontAwesomeIcon icon={faClock} />
          <span>
            Chủ điểm này đang chờ duyệt. Vui lòng xem kỹ{" "}
            <strong>4 tab nội dung</strong> trước khi publish.
          </span>
        </div>
      )}

      {/* TAB BAR */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabBtn} ${
              activeTab === tab.key ? styles.tabBtnActive : ""
            }`}
            onClick={() => handleTabChange(tab)}
          >
            <FontAwesomeIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CONTENT WRAPPER */}
      <div className={styles.contentWrapper}>
        <div className={styles.contentHeader}>
          <div className={styles.contentIcon}>
            <FontAwesomeIcon icon={activeTabObj.icon} />
          </div>
          <h2 className={styles.contentTitle}>
            {activeTabObj.label.toUpperCase()}
            <span className={styles.contentSubtitle}> — {topic?.name}</span>
          </h2>
        </div>

        <div className={styles.contentBody}>
          <Outlet context={{ topic, topicId, onRefresh: fetchTopic }} />
        </div>
      </div>

      {/* REJECT MODAL */}
      <GrammarRejectForm
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleConfirmReject}
        isLoading={rejecting}
        title="Từ chối chủ điểm ngữ pháp"
      />
    </div>
  );
}

export default AdminGrammarTopicLayout;
