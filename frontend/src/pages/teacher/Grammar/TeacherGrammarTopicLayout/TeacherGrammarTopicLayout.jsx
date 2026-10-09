import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBookOpen,
  faLightbulb,
  faStar,
  faQuestionCircle,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import {
  getStatusLabel,
  getStatusColor,
} from "../../../../constants/grammarConstants";
import Loading from "../../../../components/common/Loading/Loading";
import styles from "./TeacherGrammarTopicLayout.module.css";

const TABS = [
  { key: "theory", path: "theory", label: "Lý thuyết", icon: faBookOpen },
  { key: "example", path: "examples", label: "Ví dụ", icon: faStar },
  { key: "tip", path: "tips", label: "Mẹo", icon: faLightbulb },
  { key: "quiz", path: "quiz", label: "Trắc nghiệm", icon: faQuestionCircle },
  { key: "history", path: "history", label: "Lịch sử duyệt", icon: faHistory },
];

function TeacherGrammarTopicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { topicId } = useParams();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getTopicForEdit(topicId);
      setTopic(res?.data?.data || null);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải chủ điểm.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const currentPath = location.pathname.split("/").pop();
  const activeTab = TABS.find((t) => t.path === currentPath)?.key || "theory";
  const activeTabObj = TABS.find((t) => t.key === activeTab) || TABS[0];

  const handleTabChange = (tab) => {
    navigate(`/dashboard/teacher/grammar/topics/${topicId}/${tab.path}`, {
      replace: true,
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // ===== LOADING =====
  if (loading) {
    return <Loading size="large" text="Đang tải chủ điểm..." />;
  }

  const statusColor = topic ? getStatusColor(topic.status) : null;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{topic?.name}</h1>
          <div className={styles.metaRow}>
            {topic?.slug && (
              <code className={styles.topicSlug}>/{topic.slug}</code>
            )}
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
      </div>

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

      <div className={styles.page}>
        <div className={styles.pageContent}>
          <Outlet context={{ topic, topicId, onRefresh: fetchTopic }} />
        </div>
      </div>
    </div>
  );
}

export default TeacherGrammarTopicLayout;
