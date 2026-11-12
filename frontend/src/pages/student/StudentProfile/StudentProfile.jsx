import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faBullseye,
  faTrophy,
  faCrown,
  faCalendarAlt,
  faArrowUp,
  faLock,
  faChartLine,
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
  faClock,
  faCamera,
  faTrashCan,
  faComments,
  faPenNib,
  faHeadphones,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import studentProfileService from "../../../services/studentProfileService";
import UserService from "../../../services/UserService";
import getImageUrl from "../../../utils/imageUrl";
import Loading from "../../../components/common/Loading/Loading";

import styles from "./StudentProfile.module.css";

const DEFAULT_AVATAR = "/uploads/avatars/default-avatar.png";
const MAX_LEVEL = 30; // Cấu hình Max Level

const COLORS = {
  practice: "#0ea792",
  conversation: "#f63b3b",
};

const CHART_LEFT = 40;
const CHART_RIGHT = 480;
const CHART_TOP = 20;
const CHART_BOTTOM = 170;
const TOOLTIP_WIDTH = 160;
const TOOLTIP_HEIGHT = 56;

function StudentProfile() {
  const [user, setUser] = useState(null);
  const [level, setLevel] = useState(null);
  const [stats, setStats] = useState(null);
  const [membership, setMembership] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [activeChartTooltip, setActiveChartTooltip] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [userRes, levelRes, statsRes, membershipRes, weeklyRes] =
        await Promise.allSettled([
          UserService.getProfile(),
          studentProfileService.getLevel(),
          studentProfileService.getStats(),
          studentProfileService.getMembership(),
          studentProfileService.getWeeklyActivity(),
        ]);

      if (userRes.status === "fulfilled") {
        setUser(userRes.value?.data?.data || null);
      } else {
        console.error("Lỗi user:", userRes.reason);
        toast.error("Không thể tải thông tin cá nhân.");
      }

      if (levelRes.status === "fulfilled")
        setLevel(levelRes.value?.data?.data || null);
      if (statsRes.status === "fulfilled")
        setStats(statsRes.value?.data?.data || null);
      if (membershipRes.status === "fulfilled")
        setMembership(membershipRes.value?.data?.data || null);
      if (weeklyRes.status === "fulfilled")
        setWeeklyActivity(weeklyRes.value?.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
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

  // ===== Chart Helpers =====
  const buildWeeklyChartPoints = (weeklyData) => {
    if (!weeklyData || weeklyData.length === 0) return [];
    const chartWidth = CHART_RIGHT - CHART_LEFT;
    const chartHeight = CHART_BOTTOM - CHART_TOP;
    const N = weeklyData.length;

    const practices = weeklyData.map((d) => d.practiceCount || 0);
    const conversations = weeklyData.map((d) => d.conversationCount || 0);
    const maxVal = Math.max(...practices, ...conversations, 1);
    const yMax = maxVal * 1.2;

    return weeklyData.map((day, index) => {
      const x =
        N === 1
          ? (CHART_LEFT + CHART_RIGHT) / 2
          : CHART_LEFT + (index * chartWidth) / (N - 1);
      const practice = practices[index];
      const conversation = conversations[index];
      const yPractice = CHART_BOTTOM - (practice / yMax) * chartHeight;
      const yConversation = CHART_BOTTOM - (conversation / yMax) * chartHeight;
      return {
        x,
        yPractice,
        yConversation,
        practice,
        conversation,
        dayLabel: getDayLabel(day.date),
        dateLabel: getDayShort(day.date),
      };
    });
  };

  const buildSmoothPath = (points, yKey) => {
    if (!points || points.length === 0) return "";
    if (points.length === 1) {
      const p = points[0];
      return `M ${p.x} ${p[yKey]}`;
    }
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0][yKey]} L ${points[1].x} ${points[1][yKey]}`;
    }

    const getY = (p) => p[yKey];
    let d = `M ${points[0].x} ${getY(points[0])}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = getY(p1) + (getY(p2) - getY(p0)) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = getY(p2) - (getY(p3) - getY(p1)) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${getY(p2)}`;
    }
    return d;
  };

  const buildSmoothAreaPath = (points, yKey, bottomY = CHART_BOTTOM) => {
    if (!points || points.length === 0) return "";
    const line = buildSmoothPath(points, yKey);
    const first = points[0];
    const last = points[points.length - 1];
    return `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  };

  if (loading) {
    return <Loading size="large" text="Đang tải thông tin cá nhân..." />;
  }

  if (!user) {
    return (
      <div className={styles.loadingWrapper}>
        <p>Không có dữ liệu người dùng.</p>
        <button onClick={fetchAll} className={styles.retryBtn}>
          Thử lại
        </button>
      </div>
    );
  }

  const levelData = level || {};
  const statsData = stats || {};
  const membershipData = membership || { hasMembership: false };
  const avatarUrl = user.avatarUrl || DEFAULT_AVATAR;

  const aiUsage = membershipData.aiUsage || {};
  const aiLimit = aiUsage.limit || 0;
  const aiRemaining = aiUsage.remaining || 0;
  const aiPercent = aiUsage.percent || 0;
  const isUnlimited = aiLimit === 0;
  const isAiWarning = !isUnlimited && aiPercent >= 70;
  const isAiDanger = !isUnlimited && aiRemaining === 0;

  const weeklyChartPoints = buildWeeklyChartPoints(weeklyActivity);

  const weeklyMaxCount =
    weeklyChartPoints.length > 0
      ? Math.max(
          ...weeklyChartPoints.map((p) => Math.max(p.practice, p.conversation)),
        ) * 1.2
      : 10;

  const weeklyYAxisLabels = [
    { value: weeklyMaxCount, y: 34 },
    { value: weeklyMaxCount * 0.66, y: 80 },
    { value: weeklyMaxCount * 0.33, y: 126 },
    { value: 0, y: 174 },
  ];

  const clampX = (x) => {
    const half = TOOLTIP_WIDTH / 2;
    if (x - half < 4) return half + 4;
    if (x + half > 496) return 496 - half;
    return x;
  };

  const practiceLine = buildSmoothPath(weeklyChartPoints, "yPractice");
  const conversationLine = buildSmoothPath(weeklyChartPoints, "yConversation");
  const practiceArea = buildSmoothAreaPath(weeklyChartPoints, "yPractice");
  const conversationArea = buildSmoothAreaPath(
    weeklyChartPoints,
    "yConversation",
  );

  const totalAi = statsData.totalAiAnswers || 0;
  const correctAi = statsData.totalAiCorrect || 0;

  const convMessages = statsData.totalMessages || 0;
  const convCorrect = statsData.correctMessages || 0;

  const listeningTotal = statsData.totalListeningAnswers || 0;
  const listeningCorrect = statsData.totalListeningCorrect || 0;

  // Check Max Level
  const currentLevel = levelData.level || 1;
  const isMaxLevel = currentLevel >= MAX_LEVEL;

  return (
    <div className={styles.wrapper}>
      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroAvatarWrapper}>
            <div className={styles.heroAvatar}>
              <img
                src={getImageUrl(avatarUrl)}
                alt={user.fullName}
                onError={(e) => {
                  e.target.src = getImageUrl(DEFAULT_AVATAR);
                }}
              />
            </div>
            <button
              className={styles.avatarEditBtn}
              onClick={() => setShowAvatarModal(true)}
              title="Đổi ảnh đại diện"
            >
              <FontAwesomeIcon icon={faCamera} />
            </button>
          </div>

          <div className={styles.heroInfo}>
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
                Tham gia {formatDate(user.createdAt)}
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
        </div>

        <div className={styles.heroLevelBox}>
          <div className={styles.levelBoxHeader}>
            <div className={styles.levelIconSmall}>
              <span>{currentLevel}</span>
            </div>
            <div>
              <span className={styles.levelBoxLabel}>LEVEL {currentLevel}</span>
              <span className={styles.levelBoxTitle}>
                {levelData.titleEmoji} {levelData.title}
              </span>
            </div>
          </div>

          <div className={styles.levelBoxProgress}>
            <div className={styles.levelBoxProgressHeader}>
              {isMaxLevel ? (
                <span>Đạt cấp độ tối đa</span>
              ) : (
                <span>Tiến độ lên Level {currentLevel + 1}</span>
              )}
              <strong>
                {isMaxLevel ? 100 : levelData.progressPercent || 0}%
              </strong>
            </div>
            <div className={styles.levelBoxTrack}>
              <div
                className={styles.levelBoxFill}
                style={{
                  width: `${isMaxLevel ? 100 : levelData.progressPercent || 0}%`,
                }}
              />
            </div>
            <div className={styles.levelBoxFooter}>
              <FontAwesomeIcon icon={isMaxLevel ? faTrophy : faArrowUp} />
              <span>
                {isMaxLevel ? (
                  <strong>Bạn đã đạt cảnh giới cao nhất!</strong>
                ) : (
                  <>
                    Còn{" "}
                    <strong>
                      {(levelData.xpRemaining || 0).toLocaleString("vi-VN")} XP
                    </strong>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD GRID */}
      <section className={styles.dashboardGrid}>
        {/* MEMBERSHIP CARD */}
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

          {membershipData.hasMembership ? (
            <div className={styles.membershipContent}>
              <div className={styles.membershipTop}>
                <h4 className={styles.packageName}>
                  {membershipData.packageName}
                </h4>
                <span
                  className={`${styles.statusBadge} ${
                    membershipData.remainingDays <= 7
                      ? styles.statusWarning
                      : styles.statusActive
                  }`}
                >
                  {membershipData.remainingDays <= 7
                    ? "Sắp hết hạn"
                    : "Đang hoạt động"}
                </span>
              </div>

              <div className={styles.membershipInfoGrid}>
                <div className={styles.membershipInfoItem}>
                  <span className={styles.membershipInfoLabel}>Hết hạn</span>
                  <span className={styles.membershipInfoValue}>
                    {formatDate(membershipData.endDate)}
                  </span>
                </div>
                <div className={styles.membershipInfoItem}>
                  <span className={styles.membershipInfoLabel}>Còn lại</span>
                  <span className={styles.membershipInfoValueHighlight}>
                    {membershipData.remainingDays} ngày
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

        {/* WEEKLY ACTIVITY CHART */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.iconBoxBlue}>
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Hoạt động 7 ngày</h3>
                <p className={styles.cardSubtitle}>
                  Luyện dịch và hội thoại mỗi ngày
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
            <>
              <div className={styles.chartLegend}>
                <span className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{
                      background: COLORS.practice,
                      boxShadow: `0 0 0 3px ${COLORS.practice}20`,
                    }}
                  />
                  Luyện dịch
                </span>
                <span className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{
                      background: COLORS.conversation,
                      boxShadow: `0 0 0 3px ${COLORS.conversation}20`,
                    }}
                  />
                  Hội thoại
                </span>
              </div>

              <div className={styles.weeklyChartSvgWrapper}>
                <svg viewBox="0 0 500 210" className={styles.weeklyChartSvg}>
                  <defs>
                    <linearGradient
                      id="practiceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={COLORS.practice}
                        stopOpacity="0.28"
                      />
                      <stop
                        offset="100%"
                        stopColor={COLORS.practice}
                        stopOpacity="0"
                      />
                    </linearGradient>
                    <linearGradient
                      id="conversationGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={COLORS.conversation}
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor={COLORS.conversation}
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <line
                    x1={CHART_LEFT}
                    y1={30}
                    x2={CHART_RIGHT}
                    y2={30}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1={CHART_LEFT}
                    y1={80}
                    x2={CHART_RIGHT}
                    y2={80}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1={CHART_LEFT}
                    y1={130}
                    x2={CHART_RIGHT}
                    y2={130}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1={CHART_LEFT}
                    y1={170}
                    x2={CHART_RIGHT}
                    y2={170}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />

                  {weeklyChartPoints.map((p, i) => (
                    <line
                      key={`v-${i}`}
                      x1={p.x}
                      y1={30}
                      x2={p.x}
                      y2={170}
                      className={styles.chartGridLine}
                    />
                  ))}

                  {weeklyYAxisLabels.map((lbl, i) => (
                    <text
                      key={i}
                      x="15"
                      y={lbl.y + 3}
                      className={styles.svgText}
                    >
                      {Math.round(lbl.value)}
                    </text>
                  ))}

                  {practiceArea && (
                    <path d={practiceArea} fill="url(#practiceGradient)" />
                  )}
                  {conversationArea && (
                    <path
                      d={conversationArea}
                      fill="url(#conversationGradient)"
                    />
                  )}

                  {practiceLine && (
                    <path
                      d={practiceLine}
                      stroke={COLORS.practice}
                      className={styles.chartLine}
                    />
                  )}
                  {conversationLine && (
                    <path
                      d={conversationLine}
                      stroke={COLORS.conversation}
                      className={styles.chartLine}
                    />
                  )}

                  {weeklyChartPoints.map((item, index) => (
                    <g key={index}>
                      <circle
                        cx={item.x}
                        cy={item.yPractice}
                        r="4"
                        fill="#ffffff"
                        stroke={COLORS.practice}
                        strokeWidth="2.5"
                        className={styles.chartPoint}
                        onMouseEnter={() =>
                          setActiveChartTooltip({
                            x: clampX(item.x),
                            y: Math.min(item.yPractice, item.yConversation),
                            text: `${item.dayLabel} (${item.dateLabel})`,
                            practice: item.practice,
                            conversation: item.conversation,
                          })
                        }
                        onMouseLeave={() => setActiveChartTooltip(null)}
                      />
                      <circle
                        cx={item.x}
                        cy={item.yConversation}
                        r="4"
                        fill="#ffffff"
                        stroke={COLORS.conversation}
                        strokeWidth="2.5"
                        className={styles.chartPoint}
                        onMouseEnter={() =>
                          setActiveChartTooltip({
                            x: clampX(item.x),
                            y: Math.min(item.yPractice, item.yConversation),
                            text: `${item.dayLabel} (${item.dateLabel})`,
                            practice: item.practice,
                            conversation: item.conversation,
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

                  {activeChartTooltip &&
                    (() => {
                      const tx = activeChartTooltip.x;
                      const ty = Math.max(
                        activeChartTooltip.y - TOOLTIP_HEIGHT - 8,
                        4,
                      );
                      return (
                        <g className={styles.chartTooltip}>
                          <rect
                            x={tx - TOOLTIP_WIDTH / 2}
                            y={ty}
                            width={TOOLTIP_WIDTH}
                            height={TOOLTIP_HEIGHT}
                            rx="8"
                            fill="#ffffff"
                          />
                          <text
                            x={tx}
                            y={ty + 18}
                            textAnchor="middle"
                            className={styles.tooltipTitle}
                          >
                            {activeChartTooltip.text}
                          </text>
                          <text
                            x={tx - TOOLTIP_WIDTH / 2 + 14}
                            y={ty + 36}
                            className={styles.tooltipText}
                            fill={COLORS.practice}
                          >
                            ● Luyện dịch: {activeChartTooltip.practice}
                          </text>
                          <text
                            x={tx - TOOLTIP_WIDTH / 2 + 14}
                            y={ty + 50}
                            className={styles.tooltipText}
                            fill={COLORS.conversation}
                          >
                            ● Hội thoại: {activeChartTooltip.conversation}
                          </text>
                        </g>
                      );
                    })()}
                </svg>
              </div>
            </>
          )}
        </div>

        {/* CARD TỔNG HỢP 3 CỘT */}
        <div className={styles.card} style={{ gridColumn: "1 / -1" }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.iconBoxTeal}>
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Thống kê hoạt động</h3>
                <p className={styles.cardSubtitle}>
                  Chi tiết quá trình học tập
                </p>
              </div>
            </div>
          </div>

          <div className={styles.statsTriGrid}>
            {/* Cột 1: Luyện dịch */}
            <div className={styles.statColumn}>
              <div className={styles.statColHeader}>
                <div className={`${styles.statColIcon} ${styles.bgTeal}`}>
                  <FontAwesomeIcon icon={faPenNib} />
                </div>
                <span className={styles.statColTitle}>Luyện dịch</span>
              </div>

              <div className={styles.modernStatList}>
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>
                    Tổng câu đã làm
                  </span>
                  <span className={styles.modernStatValue}>{totalAi}</span>
                </div>
                <div className={styles.modernStatDivider} />
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>Số câu đúng</span>
                  <span className={styles.modernStatValueGreen}>
                    {correctAi}
                  </span>
                </div>
                <div className={styles.modernStatDivider} />
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>Số câu sai</span>
                  <span className={styles.modernStatValueRed}>
                    {Math.max(0, totalAi - correctAi)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột 2: Hội thoại */}
            <div className={styles.statColumn}>
              <div className={styles.statColHeader}>
                <div className={`${styles.statColIcon} ${styles.bgBlue}`}>
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <span className={styles.statColTitle}>Hội thoại</span>
              </div>

              <div className={styles.modernStatList}>
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>Tổng tin nhắn</span>
                  <span className={styles.modernStatValue}>{convMessages}</span>
                </div>
                <div className={styles.modernStatDivider} />
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>Tin nhắn đúng</span>
                  <span className={styles.modernStatValueGreen}>
                    {convCorrect}
                  </span>
                </div>
                <div className={styles.modernStatDivider} />
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>Tin nhắn lỗi</span>
                  <span className={styles.modernStatValueRed}>
                    {Math.max(0, convMessages - convCorrect)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột 3: Luyện nghe */}
            <div className={styles.statColumn}>
              <div className={styles.statColHeader}>
                <div className={`${styles.statColIcon} ${styles.bgCyan}`}>
                  <FontAwesomeIcon icon={faHeadphones} />
                </div>
                <span className={styles.statColTitle}>Luyện nghe</span>
              </div>

              <div className={styles.modernStatList}>
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>
                    Tổng câu đã nghe
                  </span>
                  <span className={styles.modernStatValue}>
                    {listeningTotal}
                  </span>
                </div>
                <div className={styles.modernStatDivider} />
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>
                    Số câu nghe đúng
                  </span>
                  <span className={styles.modernStatValueGreen}>
                    {listeningCorrect}
                  </span>
                </div>
                <div className={styles.modernStatDivider} />
                <div className={styles.modernStatItem}>
                  <span className={styles.modernStatLabel}>
                    Số câu nghe sai
                  </span>
                  <span className={styles.modernStatValueRed}>
                    {Math.max(0, listeningTotal - listeningCorrect)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={avatarUrl}
        onSuccess={(data) => {
          if (data?.avatarUrl) {
            setUser({ ...user, avatarUrl: data.avatarUrl });
            window.dispatchEvent(
              new CustomEvent("avatar-updated", {
                detail: { avatarUrl: data.avatarUrl },
              }),
            );
          }
        }}
      />
    </div>
  );
}

// =====================================================
// AVATAR UPLOAD MODAL
// =====================================================
function AvatarUploadModal({ isOpen, onClose, currentAvatar, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsUploading(false);
      setIsRemoving(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 2MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      const res = await UserService.uploadAvatar(selectedFile);
      const data = res?.data?.data;
      toast.success("Cập nhật ảnh đại diện thành công!");
      onSuccess?.(data);
      onClose();
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật ảnh đại diện.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh đại diện?")) return;
    try {
      setIsRemoving(true);
      const res = await UserService.removeAvatar();
      const data = res?.data?.data;
      toast.success("Đã xóa ảnh đại diện!");
      onSuccess?.(data);
      onClose();
    } catch (error) {
      console.error("Lỗi xóa avatar:", error);
      toast.error(error.response?.data?.message || "Không thể xóa ảnh.");
    } finally {
      setIsRemoving(false);
    }
  };

  const displayAvatar = previewUrl || getImageUrl(currentAvatar);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIconBox}>
              <FontAwesomeIcon icon={faCamera} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Ảnh đại diện</h2>
              <p className={styles.modalSubtitle}>Cập nhật ảnh của bạn</p>
            </div>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.avatarUploadPreview}>
            <div className={styles.avatarPreviewCircle}>
              <img
                src={displayAvatar}
                alt="Avatar"
                onError={(e) => {
                  e.target.src = getImageUrl(DEFAULT_AVATAR);
                }}
              />
              {selectedFile && (
                <div className={styles.newAvatarBadge}>Ảnh mới</div>
              )}
            </div>
            <p className={styles.avatarHint}>
              {selectedFile
                ? selectedFile.name
                : "Chọn ảnh để thay đổi (tối đa 2MB)"}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleSelectFile}
            style={{ display: "none" }}
          />

          <div className={styles.avatarActions}>
            <button
              className={styles.avatarSelectBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRemoving}
            >
              <FontAwesomeIcon icon={faCamera} />
              {selectedFile ? "Chọn ảnh khác" : "Chọn ảnh"}
            </button>
            <button
              className={styles.avatarRemoveBtn}
              onClick={handleRemove}
              disabled={isUploading || isRemoving}
            >
              {isRemoving ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faTrashCan} />
              )}
              Xóa ảnh
            </button>
          </div>
        </div>

        {selectedFile && (
          <div className={styles.modalFooter}>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={isUploading}
            >
              Hủy
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  <span>Lưu ảnh</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
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
      await UserService.updateProfile({
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
              className={`${styles.formInput} ${errors.fullName ? styles.inputError : ""}`}
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
      await UserService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
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
                className={`${styles.formInput} ${errors.oldPassword ? styles.inputError : ""}`}
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
                className={`${styles.formInput} ${errors.newPassword ? styles.inputError : ""}`}
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
                      className={`${styles.checkItem} ${checks[item.key] ? styles.checkPassed : ""}`}
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
                className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ""}`}
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
