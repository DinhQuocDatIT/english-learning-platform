import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faPlus,
  faHistory,
  faSpinner,
  faArrowRight,
  faTimes,
  faBolt,
  faLanguage,
  faStar,
  faSearch,
  faCheck,
  faClock,
  faLightbulb,
  faRobot,
  faRotate,
  faGraduationCap,
  faChevronRight,
  faMicrophone,
  faWandMagicSparkles,
  faFire,
  faRocket,
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

const TOPIC_STYLES = {
  DAILY_CONVERSATION: {
    color: "#0ea792",
    bg: "#f2fbfa",
    border: "rgba(14,167,146,.22)",
  },
  RESTAURANT: {
    color: "#e07b39",
    bg: "#fff7ed",
    border: "rgba(224,123,57,.22)",
  },
  JOB_INTERVIEW: {
    color: "#4c6ef5",
    bg: "#eef2ff",
    border: "rgba(76,110,245,.22)",
  },
  TRAVEL: { color: "#168a7c", bg: "#e6f7f4", border: "rgba(22,138,124,.22)" },
  MAKING_FRIENDS: {
    color: "#c2417d",
    bg: "#fdf2f8",
    border: "rgba(194,65,125,.22)",
  },
};

const LEVEL_STYLES = {
  BEGINNER: { color: "#0ea792", bg: "#f2fbfa", border: "#bde9e2" },
  INTERMEDIATE: { color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
  ADVANCED: { color: "#dc2626", bg: "#fee2e2", border: "#fecaca" },
};

const formatFriendlyDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (diffDays === 0) return `Hôm nay, ${timeStr}`;
  if (diffDays === 1) return `Hôm qua, ${timeStr}`;
  return `${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} · ${timeStr}`;
};

function StudentConversation() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMembership, setHasMembership] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("ALL");
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

  const handleOpenCreateModal = (preselectedTopic) => {
    if (!hasMembership) {
      toast.warning(
        "Chức năng Chat AI yêu cầu gói Premium. Vui lòng đăng ký để sử dụng!",
        { position: "top-center", autoClose: 5000 },
      );
      return;
    }
    if (preselectedTopic) setSelectedTopic(preselectedTopic);
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

  const handleViewConversation = (id) =>
    navigate(`/dashboard/student/conversation/chat/${id}`);

  const totalActive = useMemo(
    () => history.filter((h) => h.status === "ACTIVE").length,
    [history],
  );
  const totalEnded = useMemo(
    () => history.filter((h) => h.status === "ENDED").length,
    [history],
  );

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (activeTab === "ACTIVE" && item.status !== "ACTIVE") return false;
      if (activeTab === "ENDED" && item.status !== "ENDED") return false;
      if (selectedLevelFilter !== "ALL" && item.level !== selectedLevelFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const topicObj = CONVERSATION_TOPICS.find(
          (t) => t.value === item.topic,
        );
        const topicVi = topicObj?.labelVi?.toLowerCase() || "";
        const topicEn = topicObj?.label?.toLowerCase() || "";
        const levelText = getLevelDisplay(item.level)?.toLowerCase() || "";
        const lastMsg = (item.lastMessage || "").toLowerCase();
        if (
          !topicVi.includes(q) &&
          !topicEn.includes(q) &&
          !levelText.includes(q) &&
          !lastMsg.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [history, activeTab, selectedLevelFilter, searchQuery]);

  const hasActiveFilters =
    activeTab !== "ALL" ||
    selectedLevelFilter !== "ALL" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setActiveTab("ALL");
    setSelectedLevelFilter("ALL");
    setSearchQuery("");
  };

  if (loading) {
    return <Loading size="large" text="Đang tải danh sách cuộc hội thoại..." />;
  }

  return (
    <div className={styles.wrapper}>
      {/* ================= HERO ================= */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <FontAwesomeIcon icon={faWandMagicSparkles} />
            <span>English Buddy AI · Bạn đồng hành luyện nói</span>
          </div>

          <h1 className={styles.heroTitle}>
            Luyện Giao Tiếp Tiếng Anh{" "}
            <span className={styles.heroTitleGradient}>
              Tự Nhiên & Chuẩn Bản Xứ
            </span>
          </h1>

          <p className={styles.heroSubtitle}>
            Thực hành phản xạ đàm thoại 1-1 cùng AI thông minh theo chủ đề thực
            tế. Được sửa lỗi ngữ pháp, gợi ý từ vựng và hỗ trợ song ngữ tức thì!
          </p>

          <div className={styles.heroChips}>
            <div className={styles.chipItem}>
              <FontAwesomeIcon icon={faBolt} />
              <span>Sửa lỗi tức thì</span>
            </div>
            <div className={styles.chipItem}>
              <FontAwesomeIcon icon={faLanguage} />
              <span>Dịch song ngữ</span>
            </div>
            <div className={styles.chipItem}>
              <FontAwesomeIcon icon={faStar} />
              <span>3 cấp độ chuẩn CEFR</span>
            </div>
            <div className={styles.chipItem}>
              <FontAwesomeIcon icon={faLightbulb} />
              <span>5 tình huống đời sống</span>
            </div>
          </div>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryCtaBtn}
              onClick={() => handleOpenCreateModal()}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Bắt đầu cuộc hội thoại mới</span>
              <FontAwesomeIcon
                icon={faArrowRight}
                className={styles.ctaArrow}
              />
            </button>
            <div className={styles.heroHint}>
              <FontAwesomeIcon icon={faMicrophone} />
              <span>Hỗ trợ nhập liệu bằng giọng nói</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.orb} />
          <div className={styles.avatarCard}>
            <div className={styles.avatarRing}>
              <div className={styles.avatarInner}>
                <FontAwesomeIcon icon={faRobot} />
              </div>
            </div>
            <div className={styles.avatarInfo}>
              <span className={styles.avatarName}>English Buddy</span>
              <span className={styles.avatarStatus}>
                <span className={styles.onlineDot} /> Đang hoạt động
              </span>
            </div>
          </div>

          <div className={styles.chatBubble}>
            <span>"Hôm nay bạn muốn đàm thoại về chủ đề gì nào? ✨"</span>
          </div>

          <div className={styles.floatingCard1}>
            <FontAwesomeIcon icon={faFire} style={{ color: "#e07b39" }} />
            <div>
              <strong>12 ngày</strong>
              <span>Chuỗi luyện tập</span>
            </div>
          </div>

          <div className={styles.floatingCard2}>
            <FontAwesomeIcon icon={faRocket} style={{ color: "#0ea792" }} />
            <div>
              <strong>+38%</strong>
              <span>Tiến bộ tháng này</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS (3 card) ================= */}
      <section className={styles.statsSection}>
        {[
          {
            icon: faComments,
            tone: "primary",
            value: history.length,
            label: "Tổng cuộc hội thoại",
          },
          {
            icon: faBolt,
            tone: "mint",
            value: totalActive,
            label: "Đang hoạt động",
            live: true,
          },
          {
            icon: faHistory,
            tone: "secondary",
            value: totalEnded,
            label: "Đã hoàn thành",
          },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div
              className={`${styles.statIconBox} ${styles[`tone_${s.tone}`]}`}
            >
              <FontAwesomeIcon icon={s.icon} />
              {s.live && <span className={styles.livePulseDot} />}
            </div>
            <div className={styles.statText}>
              <span className={styles.statNumber}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ================= QUICK TOPICS ================= */}
      <section className={styles.quickTopicsSection}>
        <div className={styles.quickTopicsHeader}>
          <div>
            <span className={styles.sectionEyebrow}>Khởi tạo nhanh</span>
            <h3 className={styles.sectionTitle}>Chọn chủ đề để bắt đầu ngay</h3>
          </div>
          <span className={styles.quickTopicsHint}>Nhấn để bắt đầu với AI</span>
        </div>

        <div className={styles.quickTopicList}>
          {CONVERSATION_TOPICS.map((topic) => {
            const ts =
              TOPIC_STYLES[topic.value] || TOPIC_STYLES.DAILY_CONVERSATION;
            return (
              <button
                key={topic.value}
                type="button"
                className={styles.quickTopicPill}
                onClick={() => handleOpenCreateModal(topic.value)}
                style={{
                  "--topic-color": ts.color,
                  "--topic-bg": ts.bg,
                  "--topic-border": ts.border,
                }}
              >
                <span className={styles.quickTopicEmoji}>{topic.emoji}</span>
                <div className={styles.quickTopicText}>
                  <span className={styles.quickTopicLabel}>
                    {topic.labelVi}
                  </span>
                  <span className={styles.quickTopicSub}>{topic.label}</span>
                </div>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className={styles.quickTopicArrow}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= TOOLBAR ================= */}
      <section className={styles.toolbarSection}>
        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm theo chủ đề, cấp độ, nội dung tin nhắn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClearBtn}
              onClick={() => setSearchQuery("")}
              title="Xóa tìm kiếm"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.statusTabs}>
            {[
              { key: "ALL", label: "Tất cả", count: history.length },
              { key: "ACTIVE", label: "Đang mở", count: totalActive },
              { key: "ENDED", label: "Đã kết thúc", count: totalEnded },
            ].map((t) => (
              <button
                key={t.key}
                className={`${styles.statusTab} ${
                  activeTab === t.key ? styles.statusTabActive : ""
                }`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label} <span>({t.count})</span>
              </button>
            ))}
          </div>

          <select
            className={styles.levelFilterSelect}
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
          >
            <option value="ALL">Mọi trình độ</option>
            <option value="BEGINNER">Cơ bản</option>
            <option value="INTERMEDIATE">Trung cấp</option>
            <option value="ADVANCED">Nâng cao</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetFilterBtn}
              onClick={handleResetFilters}
            >
              <FontAwesomeIcon icon={faRotate} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </section>

      {/* ================= LIST ================= */}
      <section className={styles.historySection}>
        {history.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIllustration}>
              <div className={styles.emptyBlob} />
              <FontAwesomeIcon icon={faComments} className={styles.emptyIcon} />
            </div>
            <h3 className={styles.emptyTitle}>
              Chào mừng bạn đến với English Buddy AI!
            </h3>
            <p className={styles.emptyDescription}>
              Bạn chưa có cuộc trò chuyện nào. Hãy chọn một chủ đề thực tế và
              bắt đầu luyện phản xạ đàm thoại tiếng Anh ngay bây giờ nhé!
            </p>
            <button
              className={styles.emptyActionBtn}
              onClick={() => handleOpenCreateModal()}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Bắt đầu cuộc trò chuyện đầu tiên</span>
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className={styles.filterEmptyContainer}>
            <div className={styles.filterEmptyIcon}>
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <h4>Không tìm thấy cuộc hội thoại phù hợp</h4>
            <p>
              Không có cuộc hội thoại nào khớp với từ khóa "
              <strong>{searchQuery}</strong>" hoặc tiêu chí lọc hiện tại.
            </p>
            <button
              className={styles.filterResetBtn}
              onClick={handleResetFilters}
            >
              <FontAwesomeIcon icon={faRotate} />
              <span>Xóa bộ lọc tìm kiếm</span>
            </button>
          </div>
        ) : (
          <div className={styles.conversationGrid}>
            {filteredHistory.map((item) => {
              const topicObj = CONVERSATION_TOPICS.find(
                (t) => t.value === item.topic,
              );
              const topicIcon = getTopicIcon(item.topic);
              const ts =
                TOPIC_STYLES[item.topic] || TOPIC_STYLES.DAILY_CONVERSATION;
              const ls = LEVEL_STYLES[item.level] || LEVEL_STYLES.BEGINNER;
              const isActive = item.status === "ACTIVE";

              return (
                <div
                  key={item.id}
                  className={styles.conversationCard}
                  onClick={() => handleViewConversation(item.id)}
                  style={{
                    "--card-accent": ts.color,
                    "--card-bg": ts.bg,
                    "--card-border": ts.border,
                  }}
                >
                  <div className={styles.cardAccentBar} />

                  {/* TOP: icon + title + status */}
                  <div className={styles.cardHeader}>
                    <div
                      className={styles.cardTopicIcon}
                      style={{
                        backgroundColor: ts.bg,
                        color: ts.color,
                        borderColor: ts.border,
                      }}
                    >
                      <FontAwesomeIcon icon={topicIcon} />
                    </div>

                    <div className={styles.cardTopicInfo}>
                      <h3 className={styles.cardTopicTitle}>
                        {topicObj?.labelVi || getTopicDisplay(item.topic)}
                      </h3>
                      <span className={styles.cardTopicSubtitle}>
                        {topicObj?.label || item.topic}
                      </span>
                    </div>

                    <div
                      className={`${styles.cardStatusBadge} ${
                        isActive
                          ? styles.statusBadgeActive
                          : styles.statusBadgeEnded
                      }`}
                    >
                      {isActive && <span className={styles.pulseDot} />}
                      <span className={styles.cardStatusText}>
                        {isActive ? "Đang mở" : "Đã kết thúc"}
                      </span>
                    </div>
                  </div>

                  {/* META: level + date + messages */}
                  <div className={styles.cardMetaRow}>
                    <span
                      className={styles.cardLevelChip}
                      style={{
                        color: ls.color,
                        backgroundColor: ls.bg,
                        borderColor: ls.border,
                      }}
                    >
                      <FontAwesomeIcon icon={faGraduationCap} />
                      <span className={styles.cardChipText}>
                        {getLevelDisplay(item.level)}
                      </span>
                    </span>

                    <span className={styles.cardDateChip}>
                      <FontAwesomeIcon icon={faClock} />
                      <span className={styles.cardChipText}>
                        {formatFriendlyDate(item.startedAt)}
                      </span>
                    </span>

                    <span className={styles.cardMsgChip}>
                      <FontAwesomeIcon icon={faComments} />
                      <span className={styles.cardChipText}>
                        {item.messageCount || 0} tin nhắn
                      </span>
                    </span>
                  </div>

                  {/* FOOTER: action */}
                  <div className={styles.cardFooter}>
                    <span className={styles.cardActionText}>
                      {isActive
                        ? "Tiếp tục trò chuyện"
                        : "Xem lại cuộc hội thoại"}
                    </span>
                    <span className={styles.cardActionArrow}>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= MODAL ================= */}
      {showCreateModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => !creating && setShowCreateModal(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitleBox}>
                <div className={styles.modalHeaderIcon}>
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <div>
                  <h2 className={styles.modalTitle}>
                    Khởi tạo cuộc hội thoại AI
                  </h2>
                  <p className={styles.modalSubtitle}>
                    Chọn trình độ và chủ đề bạn muốn luyện tập cùng English
                    Buddy
                  </p>
                </div>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => !creating && setShowCreateModal(false)}
                disabled={creating}
                title="Đóng"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* LEVEL */}
              <div className={styles.modalSection}>
                <div className={styles.modalSectionHeader}>
                  <label className={styles.modalSectionLabel}>
                    1. Chọn trình độ
                  </label>
                  <span className={styles.modalSectionHint}>
                    AI tự động điều chỉnh độ phức tạp
                  </span>
                </div>
                <div className={styles.levelCardGrid}>
                  {CONVERSATION_LEVELS.map((level) => {
                    const isSelected = selectedLevel === level.value;
                    const si =
                      LEVEL_STYLES[level.value] || LEVEL_STYLES.BEGINNER;
                    return (
                      <div
                        key={level.value}
                        className={`${styles.levelCard} ${
                          isSelected ? styles.levelCardActive : ""
                        }`}
                        onClick={() => setSelectedLevel(level.value)}
                        style={{
                          "--level-color": si.color,
                          "--level-bg": si.bg,
                          "--level-border": si.border,
                        }}
                      >
                        <div className={styles.levelCardTop}>
                          <div className={styles.levelIndicator}>
                            <span
                              className={styles.levelDot}
                              style={{ backgroundColor: level.color }}
                            />
                            <strong>{level.label}</strong>
                          </div>
                          {isSelected && (
                            <div className={styles.selectedCheck}>
                              <FontAwesomeIcon icon={faCheck} />
                            </div>
                          )}
                        </div>
                        <p className={styles.levelDescription}>
                          {level.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOPIC */}
              <div className={styles.modalSection}>
                <div className={styles.modalSectionHeader}>
                  <label className={styles.modalSectionLabel}>
                    2. Chọn chủ đề
                  </label>
                  <span className={styles.modalSectionHint}>
                    Luyện tập tình huống giao tiếp đời thực
                  </span>
                </div>
                <div className={styles.topicCardGrid}>
                  {CONVERSATION_TOPICS.map((topic) => {
                    const isSelected = selectedTopic === topic.value;
                    const si =
                      TOPIC_STYLES[topic.value] ||
                      TOPIC_STYLES.DAILY_CONVERSATION;
                    return (
                      <div
                        key={topic.value}
                        className={`${styles.topicCard} ${
                          isSelected ? styles.topicCardActive : ""
                        }`}
                        onClick={() => setSelectedTopic(topic.value)}
                        style={{
                          "--topic-color": si.color,
                          "--topic-bg": si.bg,
                          "--topic-border": si.border,
                        }}
                      >
                        <div className={styles.topicCardEmojiBox}>
                          <span className={styles.topicCardEmoji}>
                            {topic.emoji}
                          </span>
                        </div>
                        <div className={styles.topicCardInfo}>
                          <div className={styles.topicCardTitleRow}>
                            <h4 className={styles.topicCardTitle}>
                              {topic.labelVi}
                            </h4>
                            {isSelected && (
                              <div className={styles.topicCheckMark}>
                                <FontAwesomeIcon icon={faCheck} />
                              </div>
                            )}
                          </div>
                          <span className={styles.topicCardEnSubtitle}>
                            {topic.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => !creating && setShowCreateModal(false)}
                disabled={creating}
              >
                Hủy bỏ
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleCreateConversation}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Đang khởi tạo...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faComments} />
                    <span>Bắt đầu cuộc trò chuyện</span>
                    <FontAwesomeIcon icon={faArrowRight} />
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
