import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faHistory,
  faCheckCircle,
  faSpinner,
  faPlus,
  faCalendarAlt,
  faChartBar,
  faBookOpen,
  faClock,
  faArrowRight,
  faBolt,
  faBullseye,
  faComments,
  faShoppingBag,
  faUtensils,
  faPlane,
  faBriefcase,
  faGraduationCap,
  faUsers,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import practiceService from "../../../../services/practiceService";
import { useLoading } from "../../../../contexts/LoadingContext";
import styles from "./StudentAIPractice.module.css";

const TOPIC_CONFIG = {
  DAILY_CONVERSATION: { label: "Đời sống hàng ngày", icon: faComments },
  SHOPPING: { label: "Mua sắm", icon: faShoppingBag },
  RESTAURANT: { label: "Nhà hàng & Ẩm thực", icon: faUtensils },
  TRAVEL: { label: "Du lịch & Khám phá", icon: faPlane },
  WORK: { label: "Công việc & Sự nghiệp", icon: faBriefcase },
  SCHOOL: { label: "Trường học & Giáo dục", icon: faGraduationCap },
  FAMILY: { label: "Gia đình", icon: faUsers },
  FRIENDS: { label: "Bạn bè & Xã hội", icon: faUsers },
};

const LEVEL_CONFIG = {
  A1: { label: "A1 - Sơ cấp", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  A2: { label: "A2 - Sơ cấp+", bg: "#f7fee7", color: "#65a30d", border: "#d9f99d" },
  B1: { label: "B1 - Trung cấp", bg: "#fefce8", color: "#ca8a04", border: "#fef08a" },
  B2: { label: "B2 - Trung cấp+", bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  C1: { label: "C1 - Cao cấp", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  C2: { label: "C2 - Thành thạo", bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
};

const getTopicInfo = (topicKey) => {
  return (
    TOPIC_CONFIG[topicKey] || {
      label: topicKey ? topicKey.replace(/_/g, " ") : "Chủ đề tổng hợp",
      icon: faBookOpen,
    }
  );
};

const getLevelBadge = (level) => {
  return (
    LEVEL_CONFIG[level] || {
      label: level || "B1",
      bg: "#f8fafc",
      color: "#64748b",
      border: "#e2e8f0",
    }
  );
};

const formatFriendlyDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hôm nay, ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    return `Hôm qua, ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function StudentAIPractice() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // "ALL" | "IN_PROGRESS" | "COMPLETED"

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      showLoading();
      const response = await practiceService.getPracticeHistory();
      setHistory(response?.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
      toast.error(error.response?.data?.message || "Không thể tải lịch sử.");
      setHistory([]);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleCreatePractice = () => {
    navigate("/dashboard/student/ai-practice/create");
  };

  const handleViewPractice = (chatId) => {
    navigate(`/dashboard/student/ai-practice/chat/${chatId}`);
  };

  const totalCompleted = history.filter((h) => h.status === "COMPLETED").length;
  const totalInProgress = history.filter((h) => h.status === "IN_PROGRESS").length;

  const evaluatedSessions = history.filter((h) => (h.questionCount || 0) > 0);
  const avgAccuracy =
    evaluatedSessions.length > 0
      ? Math.round(
          evaluatedSessions.reduce(
            (acc, h) =>
              acc + ((h.correctCount || 0) / (h.questionCount || 1)) * 100,
            0
          ) / evaluatedSessions.length
        )
      : 0;

  const filteredHistory = history.filter((item) => {
    if (activeTab === "IN_PROGRESS") return item.status === "IN_PROGRESS";
    if (activeTab === "COMPLETED") return item.status === "COMPLETED";
    return true;
  });

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang chuẩn bị không gian học tập AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Hero Welcome Banner */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            <FontAwesomeIcon icon={faRobot} />
            <span>Gia sư AI Luyện Dịch</span>
          </div>
          <h1 className={styles.heroTitle}>
            Rèn Phản Xạ Dịch Câu Cùng Trí Tuệ Nhân Tạo
          </h1>
          <p className={styles.heroSubtitle}>
            Thực hành dịch câu từ tiếng Việt sang tiếng Anh theo từng cấp độ.
            Nhận phân tích ngữ pháp, chấm điểm và đề xuất cách diễn đạt bản ngữ tức thì.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.heroCreateBtn} onClick={handleCreatePractice}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Bắt đầu bài tập mới</span>
            </button>
            <div className={styles.heroBadges}>
              <span className={styles.heroBadgeItem}>
                <FontAwesomeIcon icon={faBolt} /> Sửa lỗi tức thì
              </span>
              <span className={styles.heroBadgeItem}>
                <FontAwesomeIcon icon={faBullseye} /> 8 Chủ đề thực tế
              </span>
              <span className={styles.heroBadgeItem}>
                <FontAwesomeIcon icon={faStar} /> Chuẩn 6 cấp độ CEFR
              </span>
            </div>
          </div>
        </div>

        <div className={styles.heroIllustration}>
          <div className={styles.heroFloatingCard}>
            <div className={styles.floatingHeader}>
              <div className={styles.floatingRobotAvatar}>
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <div>
                <h4>Gia sư AI 24/7</h4>
                <p>Luôn sẵn sàng cùng bạn</p>
              </div>
            </div>
            <div className={styles.floatingExample}>
              <span className={styles.floatingTag}>Câu mẫu</span>
              <p>"Tôi muốn đặt một bàn cho hai người tối nay."</p>
            </div>
            <div className={styles.floatingFeedback}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>"I'd like to book a table for two tonight."</span>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Stats Bar */}
      <section className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statPrimary}`}>
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tổng bài luyện tập</span>
            <span className={styles.statValue}>{history.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statSuccess}`}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đã hoàn thành</span>
            <span className={styles.statValue}>{totalCompleted}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statWarning}`}>
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đang thực hiện</span>
            <span className={styles.statValue}>{totalInProgress}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statTeal}`}>
            <FontAwesomeIcon icon={faBullseye} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Độ chính xác TB</span>
            <span className={styles.statValue}>{avgAccuracy}%</span>
          </div>
        </div>
      </section>

      {/* History & Practices Section */}
      <section className={styles.historySection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faHistory} />
              Lịch sử bài luyện tập
            </h2>
            <span className={styles.historyTotalBadge}>{history.length} bài</span>
          </div>

          {/* Filter Tabs */}
          {history.length > 0 && (
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tabBtn} ${activeTab === "ALL" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("ALL")}
              >
                Tất cả ({history.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "IN_PROGRESS" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("IN_PROGRESS")}
              >
                Đang học ({totalInProgress})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "COMPLETED" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("COMPLETED")}
              >
                Đã xong ({totalCompleted})
              </button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          /* Empty state when no practices yet */
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <h3>Chào mừng bạn đến với Luyện Dịch AI!</h3>
            <p>
              Bạn chưa có bài luyện tập nào. Hãy chọn chủ đề bạn yêu thích và thử
              thách phản xạ ngôn ngữ cùng Gia sư AI ngay hôm nay!
            </p>
            <button className={styles.emptyStartBtn} onClick={handleCreatePractice}>
              <FontAwesomeIcon icon={faPlus} />
              Bắt đầu bài tập đầu tiên
            </button>

            {/* Quick topics recommendation */}
            <div className={styles.quickTopicsContainer}>
              <span className={styles.quickTopicsTitle}>Gợi ý chủ đề thú vị:</span>
              <div className={styles.quickTopicsList}>
                <span className={styles.quickTopicItem} onClick={handleCreatePractice}>
                  ✈️ Du lịch
                </span>
                <span className={styles.quickTopicItem} onClick={handleCreatePractice}>
                  ☕ Đời sống hàng ngày
                </span>
                <span className={styles.quickTopicItem} onClick={handleCreatePractice}>
                  🛍️ Mua sắm
                </span>
                <span className={styles.quickTopicItem} onClick={handleCreatePractice}>
                  💼 Công việc
                </span>
              </div>
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          /* Empty state for specific filter tab */
          <div className={styles.emptyFilterState}>
            <p>Không có bài luyện tập nào ở trạng thái này.</p>
            <button className={styles.resetFilterBtn} onClick={() => setActiveTab("ALL")}>
              Xem tất cả bài tập
            </button>
          </div>
        ) : (
          /* Practice Cards Grid */
          <div className={styles.practiceGrid}>
            {filteredHistory.map((item) => {
              const topicInfo = getTopicInfo(item.topic);
              const levelBadge = getLevelBadge(item.level);
              const isDone = item.status === "COMPLETED";
              const progressPct =
                item.questionLimit > 0
                  ? Math.min(Math.round((item.questionCount / item.questionLimit) * 100), 100)
                  : 0;
              const accuracy =
                item.questionCount > 0
                  ? Math.round(((item.correctCount || 0) / item.questionCount) * 100)
                  : 0;

              return (
                <div
                  key={item.id}
                  className={`${styles.practiceCard} ${isDone ? styles.cardDone : styles.cardDoing}`}
                  onClick={() => handleViewPractice(item.id)}
                >
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTopicBadge}>
                      <span className={styles.topicIconBox}>
                        <FontAwesomeIcon icon={topicInfo.icon} />
                      </span>
                      <span className={styles.topicName}>{topicInfo.label}</span>
                    </div>

                    <span
                      className={`${styles.statusPill} ${
                        isDone ? styles.statusPillDone : styles.statusPillDoing
                      }`}
                    >
                      <FontAwesomeIcon icon={isDone ? faCheckCircle : faSpinner} spin={!isDone} />
                      <span>{isDone ? "Hoàn thành" : "Đang học"}</span>
                    </span>
                  </div>

                  {/* Card Meta (Level + Date) */}
                  <div className={styles.cardMetaRow}>
                    <span
                      className={styles.levelBadge}
                      style={{
                        backgroundColor: levelBadge.bg,
                        color: levelBadge.color,
                        borderColor: levelBadge.border,
                      }}
                    >
                      {levelBadge.label}
                    </span>
                    <span className={styles.cardDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatFriendlyDate(item.startedAt)}
                    </span>
                  </div>

                  {/* Progress & Metrics */}
                  <div className={styles.cardProgressSection}>
                    <div className={styles.progressInfoRow}>
                      <span className={styles.progressLabel}>
                        Tiến độ: <strong>{item.questionCount}/{item.questionLimit} câu</strong>
                      </span>
                      <span className={styles.accuracyTag}>
                        {accuracy}% đúng
                      </span>
                    </div>

                    <div className={styles.progressBarTrack}>
                      <div
                        className={styles.progressBarFill}
                        style={{
                          width: `${progressPct}%`,
                          background: isDone
                            ? "linear-gradient(90deg, #10b981, #0ea792)"
                            : "linear-gradient(90deg, #0ea792, #52afa3)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className={styles.cardFooter}>
                    {isDone ? (
                      <span className={styles.actionLinkDone}>
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>Xem lại kết quả</span>
                      </span>
                    ) : (
                      <span className={styles.actionLinkDoing}>
                        <span>Tiếp tục luyện tập</span>
                        <FontAwesomeIcon icon={faArrowRight} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentAIPractice;
