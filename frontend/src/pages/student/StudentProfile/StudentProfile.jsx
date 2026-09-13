import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faBullseye,
  faTrophy,
  faCrown,
  faCalendarAlt,
  faArrowUp,
  faArrowDown,
  faMinus,
  faLock,
  faLightbulb,
  faSpellCheck,
  faChartLine,
  faRobot,
  faBookmark,
  faChevronDown,
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
  faHeadphones,
  faTriangleExclamation,
  faPlay,
  faClock,
  faBookOpen,
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

  const [activeChartTooltip, setActiveChartTooltip] = useState(null);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  const buildWeeklyChartPoints = (weeklyActivity) => {
    if (!weeklyActivity || weeklyActivity.length === 0) return [];

    const CHART_LEFT = 40;
    const CHART_RIGHT = 480;
    const CHART_TOP = 20;
    const CHART_BOTTOM = 170;

    const chartWidth = CHART_RIGHT - CHART_LEFT;
    const chartHeight = CHART_BOTTOM - CHART_TOP;

    const counts = weeklyActivity.map((d) => d.questionCount || 0);
    const maxCount = Math.max(...counts, 1);
    const yMax = maxCount * 1.2;

    const N = weeklyActivity.length;

    return weeklyActivity.map((day, index) => {
      let x;
      if (N === 1) {
        x = (CHART_LEFT + CHART_RIGHT) / 2;
      } else {
        x = CHART_LEFT + (index * chartWidth) / (N - 1);
      }

      const value = counts[index];
      const y = CHART_BOTTOM - (value / yMax) * chartHeight;

      return {
        x,
        y,
        count: value,
        dayLabel: getDayLabel(day.date),
        dateLabel: getDayShort(day.date),
      };
    });
  };

  const buildWeeklyChartPaths = (chartPoints) => {
    if (chartPoints.length === 0) {
      return { linePath: "", areaPath: "" };
    }

    if (chartPoints.length === 1) {
      const p = chartPoints[0];
      return {
        linePath: `M ${p.x - 5} ${p.y} L ${p.x + 5} ${p.y}`,
        areaPath: `M ${p.x - 5} 170 L ${p.x - 5} ${p.y} L ${p.x + 5} ${p.y} L ${p.x + 5} 170 Z`,
      };
    }

    const linePath = "M " + chartPoints.map((p) => `${p.x} ${p.y}`).join(" L ");

    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    const areaPath =
      `M ${first.x} 170 ` +
      `L ${first.x} ${first.y} ` +
      chartPoints.map((p) => `L ${p.x} ${p.y}`).join(" ") +
      ` L ${last.x} 170 Z`;

    return { linePath, areaPath };
  };

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

  const { user, membership } = profile;

  const overview = statistics?.overview || {};
  const levelRanking = statistics?.levelRanking || {};
  const practice = statistics?.practice || {};
  const listening = statistics?.listening || {};
  const topErrors = statistics?.topErrors || [];
  const weeklyActivity = statistics?.weeklyActivity || [];
  const aiUsageStats = statistics?.aiUsage || {};

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

  const aiUsage = membership?.aiUsage;
  const aiLimit = aiUsage?.limit || 0;
  const aiRemaining = aiUsage?.remaining || 0;
  const aiPercent = aiUsage?.percent || 0;
  const isUnlimited = aiLimit === 0;
  const isAiWarning = !isUnlimited && aiPercent >= 70;
  const isAiDanger = !isUnlimited && aiRemaining === 0;

  const weeklyChartPoints = buildWeeklyChartPoints(weeklyActivity);
  const { linePath: weeklyLinePath, areaPath: weeklyAreaPath } =
    buildWeeklyChartPaths(weeklyChartPoints);

  const weeklyMaxCount =
    weeklyChartPoints.length > 0
      ? Math.max(...weeklyChartPoints.map((p) => p.count)) * 1.2
      : 10;

  const weeklyYAxisLabels = [
    { value: weeklyMaxCount, y: 34 },
    { value: weeklyMaxCount * 0.6, y: 84 },
    { value: weeklyMaxCount * 0.3, y: 134 },
    { value: 0, y: 174 },
  ];

  return (
    <div className={styles.wrapper}>
      {/* HERO BANNER */}
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

      {/* STATS GRID */}
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

      {/* GRID 2x2 */}
      <section className={styles.dashboardGrid}>
        {/* 1. Membership */}
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

        {/* 2. Weekly Activity */}
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
            <div className={styles.weeklyChartSvgWrapper}>
              <svg viewBox="0 0 500 210" className={styles.weeklyChartSvg}>
                <defs>
                  <linearGradient
                    id="weeklyChartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0ea792" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0ea792" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <line
                  x1="40"
                  y1="30"
                  x2="480"
                  y2="30"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="80"
                  x2="480"
                  y2="80"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="130"
                  x2="480"
                  y2="130"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="170"
                  x2="480"
                  y2="170"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />

                {weeklyYAxisLabels.map((lbl, i) => (
                  <text key={i} x="15" y={lbl.y} className={styles.svgText}>
                    {Math.round(lbl.value)}
                  </text>
                ))}

                {weeklyAreaPath && (
                  <path d={weeklyAreaPath} fill="url(#weeklyChartGradient)" />
                )}

                {weeklyLinePath && (
                  <path
                    d={weeklyLinePath}
                    fill="none"
                    stroke="#0ea792"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {weeklyChartPoints.map((item, index) => (
                  <g key={index}>
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r="5"
                      fill="#ffffff"
                      stroke="#0ea792"
                      strokeWidth="3"
                      className={styles.chartPoint}
                      onMouseEnter={() =>
                        setActiveChartTooltip({
                          x: item.x,
                          y: item.y - 15,
                          text: `${item.dayLabel} (${item.dateLabel}): ${item.count} câu`,
                        })
                      }
                      onMouseLeave={() => setActiveChartTooltip(null)}
                    />
                    <text
                      x={item.x}
                      y="188"
                      textAnchor="middle"
                      className={styles.svgTextBold}
                    >
                      {item.dayLabel}
                    </text>
                    <text
                      x={item.x}
                      y="202"
                      textAnchor="middle"
                      className={styles.svgTextSmall}
                    >
                      {item.dateLabel}
                    </text>
                  </g>
                ))}

                {activeChartTooltip && (
                  <g>
                    <rect
                      x={activeChartTooltip.x - 80}
                      y={activeChartTooltip.y - 25}
                      width="160"
                      height="24"
                      rx="6"
                      fill="#1e293b"
                    />
                    <text
                      x={activeChartTooltip.x}
                      y={activeChartTooltip.y - 9}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {activeChartTooltip.text}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          )}
        </div>

        {/* 3. AI Stats */}
        <div className={styles.card}>
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

          <div className={styles.aiStatsGridNew}>
            <div className={`${styles.aiStatNew} ${styles.aiStatNewTeal}`}>
              <div className={styles.aiStatNewIcon}>
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div className={styles.aiStatNewInfo}>
                <span className={styles.aiStatNewValue}>
                  {practice.completedSessions || 0}
                </span>
                <span className={styles.aiStatNewLabel}>Buổi hoàn thành</span>
              </div>
            </div>

            <div className={`${styles.aiStatNew} ${styles.aiStatNewBlue}`}>
              <div className={styles.aiStatNewIcon}>
                <FontAwesomeIcon icon={faBookmark} />
              </div>
              <div className={styles.aiStatNewInfo}>
                <span className={styles.aiStatNewValue}>
                  {practice.totalQuestions || 0}
                </span>
                <span className={styles.aiStatNewLabel}>Câu hỏi đã làm</span>
              </div>
            </div>

            <div className={`${styles.aiStatNew} ${styles.aiStatNewOrange}`}>
              <div className={styles.aiStatNewIcon}>
                <FontAwesomeIcon icon={faBullseye} />
              </div>
              <div className={styles.aiStatNewInfo}>
                <span className={styles.aiStatNewValue}>
                  {practice.averageScore || 0}
                </span>
                <span className={styles.aiStatNewLabel}>Điểm trung bình</span>
              </div>
            </div>

            <div className={`${styles.aiStatNew} ${styles.aiStatNewGreen}`}>
              <div className={styles.aiStatNewIcon}>
                <FontAwesomeIcon icon={faBolt} />
              </div>
              <div className={styles.aiStatNewInfo}>
                <span className={styles.aiStatNewValue}>
                  {aiUsageStats.totalRequests || 0}
                </span>
                <span className={styles.aiStatNewLabel}>Lượt gọi AI</span>
              </div>
            </div>
          </div>

          <div className={styles.aiStatsDivider} />

          <div className={styles.listeningCompact}>
            <div className={styles.listeningCompactHeader}>
              <FontAwesomeIcon icon={faHeadphones} />
              <span>Luyện nghe</span>
            </div>
            <div className={styles.listeningCompactRow}>
              <div className={styles.listeningCompactItem}>
                <span className={styles.listeningCompactLabel}>Tổng câu</span>
                <span className={styles.listeningCompactValue}>
                  {listening.totalAnswers || 0}
                </span>
              </div>
              <div className={styles.listeningCompactItem}>
                <span className={styles.listeningCompactLabel}>Đúng</span>
                <span className={styles.listeningCompactValueGreen}>
                  {listening.correctAnswers || 0}
                </span>
              </div>
              <div className={styles.listeningCompactItem}>
                <span className={styles.listeningCompactLabel}>Chính xác</span>
                <span className={styles.listeningCompactValueHighlight}>
                  {listening.accuracyRate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ✅ ERROR IMPROVE - CARD MỚI */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.iconBoxRed}>
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Cần Cải Thiện</h3>
                <p className={styles.cardSubtitle}>
                  {topErrors.length > 0
                    ? `${topErrors.length} lỗi cần tập trung`
                    : "Lỗi ngữ pháp cần chú ý"}
                </p>
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
              <h4 className={styles.emptyTitle}>Tuyệt vời! 🎉</h4>
              <p className={styles.emptyText}>
                Bạn chưa có lỗi nào cần cải thiện. Tiếp tục luyện tập nhé!
              </p>
            </div>
          ) : (
            <div className={styles.errorImproveList}>
              {topErrors.map((error, index) => (
                <ErrorImproveCard key={index} error={error} index={index + 1} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODALS */}
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
// ERROR IMPROVE CARD
// =====================================================
function ErrorImproveCard({ error, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityConfig = (severity) => {
    const map = {
      HIGH: {
        bg: "#fef2f2",
        border: "#fecaca",
        text: "#dc2626",
        label: "Cần sửa gấp",
      },
      MEDIUM: {
        bg: "#fffbeb",
        border: "#fde68a",
        text: "#d97706",
        label: "Nên cải thiện",
      },
      LOW: {
        bg: "#f0fdf4",
        border: "#bbf7d0",
        text: "#16a34a",
        label: "Đang tiến bộ",
      },
    };
    return map[severity] || map.MEDIUM;
  };

  const getMasteryColor = (score) => {
    if (score < 20) return "#dc2626";
    if (score < 50) return "#f59e0b";
    if (score < 80) return "#3b82f6";
    return "#16a34a";
  };

  const getTrendConfig = (trend) => {
    const map = {
      UP: { icon: faArrowUp, color: "#dc2626", label: "Đang tăng" },
      DOWN: { icon: faArrowDown, color: "#16a34a", label: "Đang giảm" },
      STABLE: { icon: faMinus, color: "#64748b", label: "Ổn định" },
    };
    return map[trend] || map.STABLE;
  };

  const severityConfig = getSeverityConfig(error.severity);
  const masteryColor = getMasteryColor(error.masteryScore || 0);
  const trendConfig = getTrendConfig(error.trend);

  const handlePractice = () => {
    window.location.href = `/dashboard/student/ai-practice?focusError=${error.errorSubtype}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div
      className={styles.errorImproveCard}
      style={{ "--severity-color": severityConfig.text }}
    >
      {/* HEADER */}
      <div
        className={styles.errorImproveHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.errorImproveMain}>
          <div className={styles.errorImproveTopRow}>
            <span className={styles.errorImproveName}>{error.displayName}</span>
            <span
              className={styles.errorImproveSeverity}
              style={{
                background: severityConfig.bg,
                borderColor: severityConfig.border,
                color: severityConfig.text,
              }}
            >
              {severityConfig.label}
            </span>
          </div>

          <div className={styles.errorImproveMeta}>
            <span className={styles.errorImproveCount}>
              <strong>{error.count}</strong> lần mắc lỗi
            </span>
            <span className={styles.errorImproveDot}>•</span>
            <span
              className={styles.errorImproveTrend}
              style={{ color: trendConfig.color }}
            >
              <FontAwesomeIcon icon={trendConfig.icon} />
              {trendConfig.label}
            </span>
          </div>
        </div>

        <button
          className={styles.errorImproveExpandBtn}
          aria-label="Xem chi tiết"
          type="button"
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className={isExpanded ? "rotated" : ""}
          />
        </button>
      </div>

      {/* MASTERY PROGRESS BAR */}

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div className={styles.errorImproveExpanded}>
          {error.description && (
            <div className={styles.errorImproveSection}>
              <span className={styles.errorImproveSectionLabel}>
                Giải thích
              </span>
              <p className={styles.errorImproveSectionText}>
                {error.description}
              </p>
            </div>
          )}

          {error.example && (
            <div className={styles.errorImproveSection}>
              <span className={styles.errorImproveSectionLabel}>Ví dụ</span>
              <div className={styles.errorImproveExample}>{error.example}</div>
            </div>
          )}

          <div className={styles.errorImproveFooterMeta}>
            {error.firstOccurredAt && (
              <span>
                <FontAwesomeIcon icon={faCalendarAlt} />
                Lần đầu: {formatDate(error.firstOccurredAt)}
              </span>
            )}
            {error.lastOccurredAt && (
              <span>
                <FontAwesomeIcon icon={faClock} />
                Lần cuối: {formatTimeAgo(error.lastOccurredAt)}
              </span>
            )}
          </div>
        </div>
      )}
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
