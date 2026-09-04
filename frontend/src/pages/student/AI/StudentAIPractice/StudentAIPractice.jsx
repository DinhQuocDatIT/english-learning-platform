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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import practiceService from "../../../../services/practiceService";
import { useLoading } from "../../../../contexts/LoadingContext";
import styles from "./StudentAIPractice.module.css";

function StudentAIPractice() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getLevelColor = (level) => {
    const colors = {
      A1: "#22c55e",
      A2: "#84cc16",
      B1: "#eab308",
      B2: "#f97316",
      C1: "#ef4444",
      C2: "#8b5cf6",
    };
    return colors[level] || "#64748b";
  };

  const getStatusText = (status) => {
    return status === "COMPLETED" ? "Hoàn thành" : "Đang học";
  };

  const getStatusIcon = (status) => {
    return status === "COMPLETED" ? faCheckCircle : faSpinner;
  };

  const getStatusColor = (status) => {
    return status === "COMPLETED" ? "#22c55e" : "#f59e0b";
  };

  const totalCompleted = history.filter((h) => h.status === "COMPLETED").length;
  const totalInProgress = history.filter(
    (h) => h.status === "IN_PROGRESS",
  ).length;

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải lịch sử luyện tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>
            <FontAwesomeIcon icon={faRobot} className={styles.headerIcon} />
            Luyện dịch AI
          </h1>
          <span className={styles.headerBadge}>{history.length} bài tập</span>
        </div>
        <button className={styles.createBtn} onClick={handleCreatePractice}>
          <FontAwesomeIcon icon={faPlus} />
          Bắt đầu luyện tập
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.primary}`}>
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tổng số bài</span>
            <span className={styles.statValue}>{history.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.success}`}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đã hoàn thành</span>
            <span className={styles.statValue}>{totalCompleted}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.warning}`}>
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đang học</span>
            <span className={styles.statValue}>{totalInProgress}</span>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className={styles.historyContainer}>
        <div className={styles.historyHeader}>
          <h2 className={styles.historyTitle}>
            <FontAwesomeIcon icon={faHistory} />
            Lịch sử luyện tập
          </h2>
          <span className={styles.historyCount}>{history.length} bài</span>
        </div>

        {history.length === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faRobot} className={styles.emptyIcon} />
            <h3>Chưa có bài luyện tập nào</h3>
            <p>Hãy bắt đầu luyện dịch với AI ngay hôm nay!</p>
            <button className={styles.startBtn} onClick={handleCreatePractice}>
              <FontAwesomeIcon icon={faPlus} />
              Bắt đầu ngay
            </button>
          </div>
        ) : (
          <div className={styles.historyGrid}>
            {history.map((item) => (
              <div
                key={item.id}
                className={`${styles.historyCard} ${
                  item.status === "COMPLETED"
                    ? styles.completedCard
                    : styles.inProgressCard
                }`}
                onClick={() => handleViewPractice(item.id)}
              >
                <div className={styles.historyCardHeader}>
                  <div className={styles.historyCardLeft}>
                    <span
                      className={styles.historyLevel}
                      style={{ color: getLevelColor(item.level) }}
                    >
                      {item.level}
                    </span>
                    <span className={styles.historyTopic}>{item.topic}</span>
                  </div>
                  <span
                    className={`${styles.historyStatus} ${
                      item.status === "COMPLETED"
                        ? styles.statusCompleted
                        : styles.statusInProgress
                    }`}
                  >
                    <FontAwesomeIcon icon={getStatusIcon(item.status)} />
                    {getStatusText(item.status)}
                  </span>
                </div>

                <div className={styles.historyCardBody}>
                  <div className={styles.historyStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Tiến độ</span>
                      <span className={styles.statValue}>
                        {item.questionCount}/{item.questionLimit}
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Đúng</span>
                      <span
                        className={styles.statValue}
                        style={{ color: "#22c55e" }}
                      >
                        {item.correctCount}
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Độ chính xác</span>
                      <span className={styles.statValue}>
                        {item.questionCount > 0
                          ? Math.round(
                              (item.correctCount / item.questionCount) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>

                  <div className={styles.miniProgress}>
                    <div
                      className={styles.miniProgressFill}
                      style={{
                        width: `${(item.questionCount / item.questionLimit) * 100}%`,
                        background:
                          item.status === "COMPLETED"
                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                            : "linear-gradient(90deg, #0ea792, #059669)",
                      }}
                    />
                  </div>
                </div>

                <div className={styles.historyCardFooter}>
                  <span className={styles.historyDate}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {new Date(item.startedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {item.status === "COMPLETED" ? (
                    <span className={styles.viewResultLink}>
                      <FontAwesomeIcon icon={faChartBar} />
                      Xem kết quả
                    </span>
                  ) : (
                    <span className={styles.continueLink}>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Tiếp tục
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAIPractice;
