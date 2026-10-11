import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faPlus,
  faHistory,
  faClock,
  faCheckCircle,
  faSpinner,
  faArrowRight,
  faBolt,
  faStar,
  faLanguage,
  faChalkboardUser,
  faCalendarAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import conversationService from "../../../../services/conversationService";
import studentMembershipService from "../../../../services/studentMembershipService";
import { useLoading } from "../../../../contexts/LoadingContext";
import Loading from "../../../../components/common/Loading/Loading";
import {
  CONVERSATION_LEVELS,
  getLevelDisplay,
} from "../../../../constants/conversationLevelConstants";
import {
  CONVERSATION_TOPICS,
  getTopicDisplay,
  getTopicIcon,
} from "../../../../constants/conversationTopicConstants";
import styles from "./StudentConversation.module.css";

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

function StudentConversation() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMembership, setHasMembership] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("BEGINNER");
  const [selectedTopic, setSelectedTopic] = useState("DAILY_CONVERSATION");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      showLoading();

      const membershipResponse =
        await studentMembershipService.getCurrentMembership();
      setHasMembership(!!membershipResponse?.data?.data);

      const historyResponse = await conversationService.getConversationHistory(
        0,
        50,
      );
      setHistory(historyResponse?.data?.data?.content || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu.");
      setHistory([]);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleOpenCreateModal = () => {
    if (!hasMembership) {
      toast.warning(
        "Chức năng Chat AI yêu cầu gói Premium. Vui lòng đăng ký để sử dụng!",
        { position: "top-center", autoClose: 5000 },
      );
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateConversation = async () => {
    try {
      setCreating(true);
      showLoading();

      const response = await conversationService.createConversation({
        level: selectedLevel,
        topic: selectedTopic,
      });

      const conversationId = response?.data?.data?.id;
      toast.success("Tạo cuộc hội thoại thành công!");
      navigate(`/dashboard/student/conversation/chat/${conversationId}`);
    } catch (error) {
      console.error("Lỗi tạo cuộc hội thoại:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo cuộc hội thoại.",
      );
    } finally {
      setCreating(false);
      hideLoading();
    }
  };

  const handleViewConversation = (conversationId) => {
    navigate(`/dashboard/student/conversation/chat/${conversationId}`);
  };

  const totalActive = history.filter((h) => h.status === "ACTIVE").length;
  const totalEnded = history.filter((h) => h.status === "ENDED").length;

  const filteredHistory = history.filter((item) => {
    if (activeTab === "ACTIVE") return item.status === "ACTIVE";
    if (activeTab === "ENDED") return item.status === "ENDED";
    return true;
  });

  if (loading) {
    return <Loading size="large" text="Đang tải danh sách cuộc hội thoại..." />;
  }

  return (
    <div className={styles.wrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            <FontAwesomeIcon icon={faComments} />
            <span>English Buddy AI</span>
          </div>
          <h1 className={styles.heroTitle}>
            Luyện Giao Tiếp Tiếng Anh Cùng AI
          </h1>
          <p className={styles.heroSubtitle}>
            Trò chuyện tự nhiên với AI như một người bạn. Được sửa lỗi ngữ pháp,
            gợi ý cách diễn đạt tự nhiên, và nhận bản dịch tiếng Việt tức thì.
          </p>
          <div className={styles.heroActions}>
            <button
              className={styles.heroCreateBtn}
              onClick={handleOpenCreateModal}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Bắt đầu cuộc hội thoại mới</span>
            </button>
            <div className={styles.heroBadges}>
              <span className={styles.heroBadgeItem}>
                <FontAwesomeIcon icon={faBolt} /> Sửa lỗi tức thì
              </span>
              <span className={styles.heroBadgeItem}>
                <FontAwesomeIcon icon={faLanguage} /> Dịch song ngữ
              </span>
              <span className={styles.heroBadgeItem}>
                <FontAwesomeIcon icon={faStar} /> 3 cấp độ
              </span>
            </div>
          </div>
        </div>

        <div className={styles.heroIllustration}>
          <div className={styles.heroFloatingCard}>
            <div className={styles.floatingHeader}>
              <div className={styles.floatingRobotAvatar}>
                <FontAwesomeIcon icon={faChalkboardUser} />
              </div>
              <div>
                <h4>English Buddy</h4>
                <p>Luôn sẵn sàng trò chuyện</p>
              </div>
            </div>
            <div className={styles.floatingExample}>
              <span className={styles.floatingTag}>Bạn nói</span>
              <p>"I from Ho Chi Minh City"</p>
            </div>
            <div className={styles.floatingFeedback}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>"I am from Ho Chi Minh City"</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statPrimary}`}>
            <FontAwesomeIcon icon={faComments} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tổng cuộc hội thoại</span>
            <span className={styles.statValue}>{history.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statWarning}`}>
            <FontAwesomeIcon icon={faSpinner} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đang mở</span>
            <span className={styles.statValue}>{totalActive}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statSuccess}`}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đã kết thúc</span>
            <span className={styles.statValue}>{totalEnded}</span>
          </div>
        </div>
      </section>

      <section className={styles.historySection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faHistory} />
              Lịch sử cuộc hội thoại
            </h2>
            <span className={styles.historyTotalBadge}>
              {history.length} cuộc
            </span>
          </div>

          {history.length > 0 && (
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tabBtn} ${activeTab === "ALL" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("ALL")}
              >
                Tất cả ({history.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "ACTIVE" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("ACTIVE")}
              >
                Đang mở ({totalActive})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "ENDED" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("ENDED")}
              >
                Đã kết thúc ({totalEnded})
              </button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <FontAwesomeIcon icon={faComments} />
            </div>
            <h3>Chào mừng bạn đến với English Buddy AI!</h3>
            <p>
              Bạn chưa có cuộc hội thoại nào. Hãy bắt đầu trò chuyện với AI để
              luyện giao tiếp tiếng Anh ngay hôm nay!
            </p>
            <button
              className={styles.emptyStartBtn}
              onClick={handleOpenCreateModal}
            >
              <FontAwesomeIcon icon={faPlus} />
              Bắt đầu cuộc hội thoại đầu tiên
            </button>

            <div className={styles.quickTopicsContainer}>
              <span className={styles.quickTopicsTitle}>Chủ đề gợi ý:</span>
              <div className={styles.quickTopicsList}>
                {CONVERSATION_TOPICS.slice(0, 4).map((topic) => (
                  <span
                    key={topic.value}
                    className={styles.quickTopicItem}
                    onClick={handleOpenCreateModal}
                  >
                    {topic.emoji} {topic.labelVi}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className={styles.emptyFilterState}>
            <p>Không có cuộc hội thoại nào ở trạng thái này.</p>
            <button
              className={styles.resetFilterBtn}
              onClick={() => setActiveTab("ALL")}
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          <div className={styles.conversationGrid}>
            {filteredHistory.map((item) => {
              const topicIcon = getTopicIcon(item.topic);
              const isActive = item.status === "ACTIVE";

              return (
                <div
                  key={item.id}
                  className={`${styles.conversationCard} ${isActive ? styles.cardActive : styles.cardEnded}`}
                  onClick={() => handleViewConversation(item.id)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTopicBadge}>
                      <span className={styles.topicIconBox}>
                        <FontAwesomeIcon icon={topicIcon} />
                      </span>
                      <span className={styles.topicName}>
                        {getTopicDisplay(item.topic)}
                      </span>
                    </div>

                    <span
                      className={`${styles.statusPill} ${
                        isActive
                          ? styles.statusPillActive
                          : styles.statusPillEnded
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={isActive ? faSpinner : faCheckCircle}
                        spin={isActive}
                      />
                      <span>{isActive ? "Đang mở" : "Đã kết thúc"}</span>
                    </span>
                  </div>

                  <div className={styles.cardMetaRow}>
                    <span className={styles.levelBadge}>
                      {getLevelDisplay(item.level)}
                    </span>
                    <span className={styles.cardDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatFriendlyDate(item.startedAt)}
                    </span>
                  </div>

                  {item.lastMessage && (
                    <div className={styles.cardLastMessage}>
                      <p>"{item.lastMessage}"</p>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <span className={styles.messageCount}>
                      <FontAwesomeIcon icon={faComments} />
                      {item.messageCount} tin nhắn
                    </span>
                    <span
                      className={
                        isActive
                          ? styles.actionLinkActive
                          : styles.actionLinkEnded
                      }
                    >
                      <span>{isActive ? "Tiếp tục" : "Xem lại"}</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showCreateModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !creating && setShowCreateModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Bắt đầu cuộc hội thoại mới</h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => !creating && setShowCreateModal(false)}
                disabled={creating}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <label className={styles.modalLabel}>
                  Chọn trình độ của bạn
                </label>
                <div className={styles.levelOptions}>
                  {CONVERSATION_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      className={`${styles.levelOption} ${
                        selectedLevel === level.value
                          ? styles.levelOptionActive
                          : ""
                      }`}
                      onClick={() => setSelectedLevel(level.value)}
                      style={{
                        borderColor:
                          selectedLevel === level.value
                            ? level.color
                            : undefined,
                        backgroundColor:
                          selectedLevel === level.value
                            ? `${level.color}15`
                            : undefined,
                      }}
                    >
                      <span
                        className={styles.levelDot}
                        style={{ backgroundColor: level.color }}
                      />
                      <div className={styles.levelText}>
                        <strong>
                          {level.label} ({level.labelVi})
                        </strong>
                        <span>{level.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.modalSection}>
                <label className={styles.modalLabel}>Chọn chủ đề</label>
                <div className={styles.topicOptions}>
                  {CONVERSATION_TOPICS.map((topic) => (
                    <button
                      key={topic.value}
                      type="button"
                      className={`${styles.topicOption} ${
                        selectedTopic === topic.value
                          ? styles.topicOptionActive
                          : ""
                      }`}
                      onClick={() => setSelectedTopic(topic.value)}
                    >
                      <span className={styles.topicEmoji}>{topic.emoji}</span>
                      <div className={styles.topicText}>
                        <strong>{topic.labelVi}</strong>
                        <span>{topic.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => !creating && setShowCreateModal(false)}
                disabled={creating}
              >
                Hủy
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleCreateConversation}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faComments} />
                    Bắt đầu trò chuyện
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentConversation;
