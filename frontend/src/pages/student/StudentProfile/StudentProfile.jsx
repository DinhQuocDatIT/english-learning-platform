import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faBullseye,
  faTrophy,
  faCrown,
  faCalendarAlt,
  faArrowUp,
  faLock,
  faLightbulb,
  faSpellCheck,
  faTag,
  faLocationDot,
  faStopwatch,
  faList,
  faStar,
  faTriangleExclamation,
  faCheckCircle,
  faPen,
  faEnvelope,
  faVenusMars,
  faCakeCandles,
  faTimes,
  faSave,
  faSpinner,
  faEye,
  faEyeSlash,
  faShieldAlt,
  faKey,
  faUser,
  faGraduationCap,
  faChartLine,
  faHeadphones,
  faRobot,
  faBookmark,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import studentProfileService from "../../../services/studentProfileService";
import studentStatisticsService from "../../../services/studentStatisticsService";
import userService from "../../../services/userService";

import styles from "./StudentProfile.module.css";

function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // =====================================================
  // FETCH
  // =====================================================
  const fetchAll = async () => {
    try {
      setLoading(true);

      const [profileRes, statsRes] = await Promise.allSettled([
        studentProfileService.getMyProfile(),
        studentStatisticsService.getMyStatistics(),
      ]);

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value?.data?.data || null);
      } else {
        console.error("Lỗi lấy profile:", profileRes.reason);
        toast.error(
          profileRes.reason?.response?.data?.message ||
            "Không thể tải thông tin cá nhân.",
        );
        setProfile(null);
      }

      if (statsRes.status === "fulfilled") {
        setStatistics(statsRes.value?.data?.data || null);
      } else {
        console.warn("Lỗi lấy thống kê:", statsRes.reason);
        setStatistics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const [profileRes, statsRes] = await Promise.allSettled([
          studentProfileService.getMyProfile(),
          studentStatisticsService.getMyStatistics(),
        ]);

        if (!isMounted) return;

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value?.data?.data || null);
        } else {
          console.error("Lỗi lấy profile:", profileRes.reason);
          toast.error(
            profileRes.reason?.response?.data?.message ||
              "Không thể tải thông tin cá nhân.",
          );
          setProfile(null);
        }

        if (statsRes.status === "fulfilled") {
          setStatistics(statsRes.value?.data?.data || null);
        } else {
          console.warn("Lỗi lấy thống kê:", statsRes.reason);
          setStatistics(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getErrorIcon = (errorType) => {
    const map = {
      GRAMMAR: faSpellCheck,
      VOCABULARY: faLightbulb,
      ARTICLE: faTag,
      PREPOSITION: faLocationDot,
      TENSE: faStopwatch,
      WORD_ORDER: faList,
      SPELLING: faSpellCheck,
      WORD_CHOICE: faLightbulb,
      NATURALNESS: faStar,
      MISSING_WORD: faTriangleExclamation,
      EXTRA_WORD: faTriangleExclamation,
      PUNCTUATION: faSpellCheck,
      CAPITALIZATION: faSpellCheck,
    };
    return map[errorType] || faTriangleExclamation;
  };

  const getErrorColor = (errorType) => {
    const map = {
      GRAMMAR: "#3b82f6",
      VOCABULARY: "#a855f7",
      ARTICLE: "#f59e0b",
      PREPOSITION: "#06b6d4",
      TENSE: "#ef4444",
      WORD_ORDER: "#8b5cf6",
      SPELLING: "#10b981",
      WORD_CHOICE: "#f97316",
      NATURALNESS: "#ec4899",
    };
    return map[errorType] || "#64748b";
  };

  const getDayLabel = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][day];
  };

  const getDayShort = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  // =====================================================
  // LOADING / EMPTY
  // =====================================================
  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingSpinner} />
        <p>Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  if (!profile || !profile.user) {
    return (
      <div className={styles.loadingWrapper}>
        <p>Không có dữ liệu người dùng.</p>
        <button onClick={fetchAll} className={styles.retryBtn}>
          Thử lại
        </button>
      </div>
    );
  }

  // ====== DATA TỪ PROFILE ======
  const { user, membership } = profile;

  // ====== DATA TỪ STATISTICS ======
  const overview = statistics?.overview || {};
  const levelRanking = statistics?.levelRanking || {};
  const practice = statistics?.practice || {};
  const listening = statistics?.listening || {};
  const topErrors = statistics?.topErrors || [];
  const weeklyActivity = statistics?.weeklyActivity || [];
  const aiUsageStats = statistics?.aiUsage || {};

  // ===== Stats items — 3 ô =====
  const statItems = [
    {
      id: "xp",
      icon: faBolt,
      label: "Tổng XP",
      value: (overview.totalXp || 0).toLocaleString("vi-VN"),
      color: "#0ea792",
      gradient: "linear-gradient(135deg, #0ea792, #0d9488)",
      bg: "linear-gradient(135deg, #e9f8f5, #d4f3ef)",
    },
    {
      id: "accuracy",
      icon: faBullseye,
      label: "Độ chính xác",
      value: `${practice.accuracyRate || 0}%`,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
    },
    {
      id: "ranking",
      icon: faTrophy,
      label: "Xếp hạng",
      value: levelRanking.ranking ? `#${levelRanking.ranking}` : "N/A",
      suffix: null,
      color: "#a855f7",
      gradient: "linear-gradient(135deg, #a855f7, #9333ea)",
      bg: "linear-gradient(135deg, #faf5ff, #f3e8ff)",
    },
  ];

  // ===== AI Usage =====
  const aiUsage = membership?.aiUsage;
  const aiLimit = aiUsage?.limit || 0;
  const aiRemaining = aiUsage?.remaining || 0;
  const aiPercent = aiUsage?.percent || 0;
  const isUnlimited = aiLimit === 0;
  const isAiWarning = !isUnlimited && aiPercent >= 70;
  const isAiDanger = !isUnlimited && aiRemaining === 0;

  // ===== Weekly max =====
  const weeklyMax = Math.max(
    ...weeklyActivity.map((d) => d.questionCount || 0),
    1,
  );

  return (
    <div className={styles.wrapper}>
      {/* =====================================================
          HERO BANNER
          ===================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            <FontAwesomeIcon icon={faGraduationCap} />
            <span>Hồ sơ học tập</span>
          </div>

          <h1 className={styles.heroTitle}>{user.fullName}</h1>

          <div className={styles.heroMeta}>
            <span className={styles.heroMetaItem}>
              <FontAwesomeIcon icon={faEnvelope} />
              {user.email}
            </span>
            {user.gender && (
              <span className={styles.heroMetaItem}>
                <FontAwesomeIcon icon={faVenusMars} />
                {user.gender}
              </span>
            )}
            {user.dateOfBirth && (
              <span className={styles.heroMetaItem}>
                <FontAwesomeIcon icon={faCakeCandles} />
                {formatDate(user.dateOfBirth)}
              </span>
            )}
            <span className={styles.heroMetaItem}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              Tham gia {formatDate(user.joinDate)}
            </span>
          </div>

          <div className={styles.heroActions}>
            <button
              className={styles.heroBtnPrimary}
              onClick={() => setShowEditModal(true)}
            >
              <FontAwesomeIcon icon={faPen} />
              <span>Chỉnh sửa</span>
            </button>
            <button
              className={styles.heroBtnGhost}
              onClick={() => setShowPasswordModal(true)}
            >
              <FontAwesomeIcon icon={faLock} />
              <span>Đổi mật khẩu</span>
            </button>
          </div>
        </div>

        {/* Level Box */}
        <div className={styles.heroLevelBox}>
          <div className={styles.levelBoxHeader}>
            <div className={styles.levelIconSmall}>
              <span>{levelRanking.level || 1}</span>
            </div>
            <div>
              <span className={styles.levelBoxLabel}>
                LEVEL {levelRanking.level || 1}
              </span>
              <span className={styles.levelBoxTitle}>
                {levelRanking.titleEmoji} {levelRanking.title}
              </span>
            </div>
          </div>

          <div className={styles.levelBoxProgress}>
            <div className={styles.levelBoxProgressHeader}>
              <span>Tiến độ lên Level {(levelRanking.level || 1) + 1}</span>
              <strong>{levelRanking.progressPercent || 0}%</strong>
            </div>
            <div className={styles.levelBoxTrack}>
              <div
                className={styles.levelBoxFill}
                style={{ width: `${levelRanking.progressPercent || 0}%` }}
              >
                <div className={styles.shimmer} />
              </div>
            </div>
            <div className={styles.levelBoxFooter}>
              <FontAwesomeIcon icon={faArrowUp} />
              <span>
                Còn{" "}
                <strong>
                  {(levelRanking.xpRemaining || 0).toLocaleString("vi-VN")} XP
                </strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS GRID — 3 ô
          ===================================================== */}
      <section className={styles.statsGrid}>
        {statItems.map((item) => (
          <div key={item.id} className={styles.statCard}>
            <div
              className={styles.statIconBox}
              style={{ background: item.gradient }}
            >
              <FontAwesomeIcon icon={item.icon} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{item.label}</span>
              <div className={styles.statValueRow}>
                <span
                  className={styles.statValue}
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
                {item.suffix && (
                  <span className={styles.statSuffix}>{item.suffix}</span>
                )}
              </div>
            </div>
            <div
              className={styles.statDecorCircle}
              style={{ background: item.bg }}
            />
          </div>
        ))}
      </section>

      {/* =====================================================
          GRID 2x2: Membership + Weekly + Listening + Errors
          ===================================================== */}
      <section className={styles.dashboardGrid}>
        {/* 1. Membership - Top Left */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.iconBoxGold}>
                <FontAwesomeIcon icon={faCrown} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Gói thành viên</h3>
                <p className={styles.cardSubtitle}>
                  Quyền lợi hiện tại của bạn
                </p>
              </div>
            </div>
          </div>

          {membership.hasMembership ? (
            <div className={styles.membershipContent}>
              <div className={styles.membershipTop}>
                <h4 className={styles.packageName}>{membership.packageName}</h4>
                <span
                  className={`${styles.statusBadge} ${
                    membership.remainingDays <= 7
                      ? styles.statusWarning
                      : styles.statusActive
                  }`}
                >
                  {membership.remainingDays <= 7
                    ? "Sắp hết hạn"
                    : "Đang hoạt động"}
                </span>
              </div>

              <div className={styles.membershipInfoGrid}>
                <div className={styles.membershipInfoItem}>
                  <span className={styles.membershipInfoLabel}>Hết hạn</span>
                  <span className={styles.membershipInfoValue}>
                    {formatDate(membership.endDate)}
                  </span>
                </div>
                <div className={styles.membershipInfoItem}>
                  <span className={styles.membershipInfoLabel}>Còn lại</span>
                  <span className={styles.membershipInfoValueHighlight}>
                    {membership.remainingDays} ngày
                  </span>
                </div>
              </div>

              <div className={styles.aiBox}>
                <div className={styles.aiBoxHeader}>
                  <span className={styles.aiBoxLabel}>
                    <FontAwesomeIcon icon={faBolt} />
                    Lượt AI hôm nay
                  </span>
                  {isUnlimited ? (
                    <span className={styles.unlimitedTag}>Không giới hạn</span>
                  ) : (
                    <span
                      className={`${styles.aiBoxCount} ${
                        isAiDanger
                          ? styles.aiBoxDanger
                          : isAiWarning
                            ? styles.aiBoxWarning
                            : ""
                      }`}
                    >
                      {aiRemaining}/{aiLimit}
                    </span>
                  )}
                </div>
                {!isUnlimited && (
                  <div className={styles.aiBoxTrack}>
                    <div
                      className={`${styles.aiBoxFill} ${
                        isAiDanger
                          ? styles.aiBoxFillDanger
                          : isAiWarning
                            ? styles.aiBoxFillWarning
                            : ""
                      }`}
                      style={{ width: `${Math.min(aiPercent, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.membershipEmpty}>
              <FontAwesomeIcon
                icon={faLock}
                className={styles.membershipEmptyIcon}
              />
              <p>Bạn chưa đăng ký gói thành viên nào</p>
            </div>
          )}
        </div>

        {/* 2. Weekly Activity - Top Right */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.iconBoxBlue}>
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Hoạt động 7 ngày</h3>
                <p className={styles.cardSubtitle}>
                  Số câu hỏi đã làm mỗi ngày
                </p>
              </div>
            </div>
          </div>

          {weeklyActivity.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconGreen}>
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h4 className={styles.emptyTitle}>Chưa có hoạt động</h4>
              <p className={styles.emptyText}>
                Bắt đầu luyện tập để xem biểu đồ!
              </p>
            </div>
          ) : (
            <div className={styles.weeklyChart}>
              {weeklyActivity.map((day, idx) => {
                const heightPercent =
                  ((day.questionCount || 0) / weeklyMax) * 100;
                return (
                  <div key={idx} className={styles.weeklyBarWrapper}>
                    <div className={styles.weeklyBarValueTop}>
                      {day.questionCount > 0 ? day.questionCount : ""}
                    </div>
                    <div className={styles.weeklyBarTrack}>
                      <div
                        className={styles.weeklyBarFill}
                        style={{
                          height: `${Math.max(heightPercent, 4)}%`,
                        }}
                      />
                    </div>
                    <span className={styles.weeklyBarLabel}>
                      {getDayLabel(day.date)}
                    </span>
                    <span className={styles.weeklyBarDate}>
                      {getDayShort(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Listening - Bottom Left */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.iconBoxCyan}>
                <FontAwesomeIcon icon={faHeadphones} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Luyện nghe</h3>
                <p className={styles.cardSubtitle}>Kết quả bài nghe</p>
              </div>
            </div>
          </div>

          <div className={styles.listeningStats}>
            <div className={styles.listeningItem}>
              <span className={styles.listeningLabel}>Tổng số câu</span>
              <span className={styles.listeningValue}>
                {listening.totalAnswers || 0}
              </span>
            </div>
            <div className={styles.listeningItem}>
              <span className={styles.listeningLabel}>Trả lời đúng</span>
              <span className={styles.listeningValueGreen}>
                {listening.correctAnswers || 0}
              </span>
            </div>
            <div className={styles.listeningItem}>
              <span className={styles.listeningLabel}>Độ chính xác</span>
              <span className={styles.listeningValueHighlight}>
                {listening.accuracyRate || 0}%
              </span>
            </div>
          </div>

          <div className={styles.vocabProgressTrack}>
            <div
              className={styles.vocabProgressFill}
              style={{
                width: `${listening.accuracyRate || 0}%`,
              }}
            />
          </div>
        </div>

        {/* 4. Top Errors - Bottom Right */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.iconBoxRed}>
                <FontAwesomeIcon icon={faBullseye} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Lỗi thường gặp</h3>
                <p className={styles.cardSubtitle}>Tất cả lỗi cần cải thiện</p>
              </div>
            </div>
            {topErrors.length > 0 && (
              <span className={styles.countBadge}>{topErrors.length}</span>
            )}
          </div>

          {topErrors.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconGreen}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h4 className={styles.emptyTitle}>Chưa có dữ liệu</h4>
              <p className={styles.emptyText}>
                Luyện tập với AI để nhận phân tích chi tiết!
              </p>
            </div>
          ) : (
            <div className={styles.weaknessList}>
              {topErrors.map((error, index) => {
                const icon = getErrorIcon(error.errorType);
                const color = getErrorColor(error.errorType);
                const isHigh = (error.highSeverity || 0) > 0;

                return (
                  <div
                    key={index}
                    className={styles.weaknessItemSimple}
                    style={{ borderLeftColor: color }}
                  >
                    <div
                      className={styles.weaknessIcon}
                      style={{ background: `${color}15`, color }}
                    >
                      <FontAwesomeIcon icon={icon} />
                    </div>
                    <div className={styles.weaknessTitle}>
                      <span className={styles.weaknessName}>
                        {error.displayName}
                      </span>
                      <span className={styles.weaknessCount}>
                        Mắc {error.count} lần
                      </span>
                    </div>
                    <span
                      className={styles.weaknessBadge}
                      style={{
                        background: isHigh ? "#fee2e2" : "#fef3c7",
                        color: isHigh ? "#dc2626" : "#d97706",
                      }}
                    >
                      {isHigh ? "Nghiêm trọng" : "Trung bình"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          AI STATS
          ===================================================== */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div className={styles.iconBoxPurple}>
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Thống kê luyện tập AI</h3>
              <p className={styles.cardSubtitle}>Tổng hợp hoạt động</p>
            </div>
          </div>
        </div>

        <div className={styles.aiStatsGrid}>
          <div className={`${styles.aiStatItem} ${styles.aiStatTeal}`}>
            <div className={styles.aiStatIcon}>
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div>
              <span className={styles.aiStatValue}>
                {practice.completedSessions || 0}
              </span>
              <span className={styles.aiStatLabel}>Buổi hoàn thành</span>
            </div>
          </div>
          <div className={`${styles.aiStatItem} ${styles.aiStatBlue}`}>
            <div className={styles.aiStatIcon}>
              <FontAwesomeIcon icon={faBookmark} />
            </div>
            <div>
              <span className={styles.aiStatValue}>
                {practice.totalQuestions || 0}
              </span>
              <span className={styles.aiStatLabel}>Câu hỏi đã làm</span>
            </div>
          </div>
          <div className={`${styles.aiStatItem} ${styles.aiStatOrange}`}>
            <div className={styles.aiStatIcon}>
              <FontAwesomeIcon icon={faBullseye} />
            </div>
            <div>
              <span className={styles.aiStatValue}>
                {practice.averageScore || 0}
              </span>
              <span className={styles.aiStatLabel}>Điểm trung bình</span>
            </div>
          </div>
          <div className={`${styles.aiStatItem} ${styles.aiStatGreen}`}>
            <div className={styles.aiStatIcon}>
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <div>
              <span className={styles.aiStatValue}>
                {aiUsageStats.totalRequests || 0}
              </span>
              <span className={styles.aiStatLabel}>Lượt gọi AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MODALS
          ===================================================== */}
      <EditProfileModal
        isOpen={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          fetchAll();
        }}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

// =====================================================
// EDIT PROFILE MODAL
// =====================================================
function EditProfileModal({ isOpen, user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        fullName: user.fullName || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
      });
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await userService.updateProfile({
        fullName: formData.fullName.trim(),
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
      });
      toast.success("Cập nhật thông tin thành công!");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật thông tin.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) =>
        e.target === e.currentTarget && !isSubmitting && onClose()
      }
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIconBox}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Chỉnh sửa thông tin</h2>
              <p className={styles.modalSubtitle}>Cập nhật thông tin cá nhân</p>
            </div>
          </div>
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faEnvelope} />
              Email
            </label>
            <input
              type="email"
              className={`${styles.formInput} ${styles.inputDisabled}`}
              value={user?.email || ""}
              disabled
            />
            <span className={styles.formHint}>Email không thể thay đổi</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faUser} />
              Họ và tên <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              className={`${styles.formInput} ${
                errors.fullName ? styles.inputError : ""
              }`}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              autoFocus
            />
            {errors.fullName && (
              <span className={styles.errorText}>{errors.fullName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faVenusMars} />
              Giới tính
            </label>
            <div className={styles.radioGroup}>
              {[
                { value: "Nam", label: "Nam" },
                { value: "Nữ", label: "Nữ" },
                { value: "Khác", label: "Khác" },
              ].map((option) => (
                <label key={option.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={formData.gender === option.value}
                    onChange={handleChange}
                    className={styles.radio}
                  />
                  <span className={styles.radioCustom}></span>
                  <span className={styles.radioText}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faCakeCandles} />
              Ngày sinh
            </label>
            <input
              type="date"
              name="dateOfBirth"
              className={styles.formInput}
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </form>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// CHANGE PASSWORD MODAL
// =====================================================
function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.oldPassword)
      newErrors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else {
      const c = validatePassword(formData.newPassword);
      if (!c.length) newErrors.newPassword = "Ít nhất 8 ký tự";
      else if (!c.uppercase) newErrors.newPassword = "Cần 1 chữ hoa";
      else if (!c.lowercase) newErrors.newPassword = "Cần 1 chữ thường";
      else if (!c.number) newErrors.newPassword = "Cần 1 chữ số";
      else if (!c.special) newErrors.newPassword = "Cần 1 ký tự đặc biệt";
      else if (formData.newPassword === formData.oldPassword)
        newErrors.newPassword = "Mật khẩu mới không được trùng mật khẩu cũ";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await userService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đổi mật khẩu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checks = validatePassword(formData.newPassword);
  const passedCount = Object.values(checks).filter(Boolean).length;
  const strengthPercent = (passedCount / 5) * 100;
  const strength =
    passedCount <= 2
      ? { label: "Yếu", color: "#ef4444" }
      : passedCount <= 3
        ? { label: "Trung bình", color: "#f59e0b" }
        : passedCount <= 4
          ? { label: "Mạnh", color: "#3b82f6" }
          : { label: "Rất mạnh", color: "#16a34a" };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) =>
        e.target === e.currentTarget && !isSubmitting && onClose()
      }
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIconBoxPurple}>
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Đổi mật khẩu</h2>
              <p className={styles.modalSubtitle}>
                Bảo vệ tài khoản với mật khẩu mạnh
              </p>
            </div>
          </div>
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faKey} />
              Mật khẩu hiện tại <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPasswords.old ? "text" : "password"}
                name="oldPassword"
                className={`${styles.formInput} ${
                  errors.oldPassword ? styles.inputError : ""
                }`}
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu hiện tại"
                autoFocus
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => toggleShow("old")}
                tabIndex={-1}
              >
                <FontAwesomeIcon
                  icon={showPasswords.old ? faEyeSlash : faEye}
                />
              </button>
            </div>
            {errors.oldPassword && (
              <span className={styles.errorText}>{errors.oldPassword}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faLock} />
              Mật khẩu mới <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                className={`${styles.formInput} ${
                  errors.newPassword ? styles.inputError : ""
                }`}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => toggleShow("new")}
                tabIndex={-1}
              >
                <FontAwesomeIcon
                  icon={showPasswords.new ? faEyeSlash : faEye}
                />
              </button>
            </div>

            {formData.newPassword && (
              <>
                <div className={styles.strengthWrapper}>
                  <div className={styles.strengthTrack}>
                    <div
                      className={styles.strengthFill}
                      style={{
                        width: `${strengthPercent}%`,
                        background: strength.color,
                      }}
                    />
                  </div>
                  <span
                    className={styles.strengthLabel}
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>

                <div className={styles.checklist}>
                  {[
                    { key: "length", label: "Ít nhất 8 ký tự" },
                    { key: "uppercase", label: "1 chữ hoa" },
                    { key: "lowercase", label: "1 chữ thường" },
                    { key: "number", label: "1 chữ số" },
                    { key: "special", label: "1 ký tự đặc biệt" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`${styles.checkItem} ${
                        checks[item.key] ? styles.checkPassed : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {errors.newPassword && (
              <span className={styles.errorText}>{errors.newPassword}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faLock} />
              Xác nhận mật khẩu <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                className={`${styles.formInput} ${
                  errors.confirmPassword ? styles.inputError : ""
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => toggleShow("confirm")}
                tabIndex={-1}
              >
                <FontAwesomeIcon
                  icon={showPasswords.confirm ? faEyeSlash : faEye}
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>
        </form>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={styles.submitBtnPurple}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                <span>Đổi mật khẩu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
