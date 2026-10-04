import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faBookOpen,
  faStar,
  faLightbulb,
  faQuestionCircle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import styles from "./StudentGrammarTopicLayout.module.css";

// 4 tab cho Student
const TABS = [
  { key: "theory", path: "theory", label: "Bài giảng", icon: faBookOpen },
  { key: "example", path: "examples", label: "Ví dụ", icon: faStar },
  { key: "tip", path: "tips", label: "Mẹo TOEIC", icon: faLightbulb },
  { key: "quiz", path: "quiz", label: "Trắc nghiệm", icon: faQuestionCircle },
];

function StudentGrammarTopicLayout() {
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
      const res = await grammarService.getTopicDetail(topicId);
      setTopic(res?.data?.data || null);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải chủ điểm.");
      navigate("/dashboard/student/grammar");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xác định tab active từ path
  const pathParts = location.pathname.split("/").filter(Boolean);
  const topicIdIdx = pathParts.findIndex((p) => p === String(topicId));
  const subPath = pathParts[topicIdIdx + 1] || "theory";

  const activeTab = TABS.find((t) => t.path === subPath)?.key || "theory";
  const activeTabObj = TABS.find((t) => t.key === activeTab) || TABS[0];

  const handleTabChange = (tab) => {
    navigate(`/dashboard/student/grammar/topics/${topicId}/${tab.path}`, {
      replace: true,
    });
  };

  const handleBack = () => {
    navigate(-1);
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
      <button className={styles.backBtn} onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

      {/* HEADER */}
      {/* <div className={styles.headerCard}>
        <h1 className={styles.headerTitle}>{topic?.name}</h1>
      </div> */}

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

      {/* CONTENT */}
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
    </div>
  );
}

export default StudentGrammarTopicLayout;
