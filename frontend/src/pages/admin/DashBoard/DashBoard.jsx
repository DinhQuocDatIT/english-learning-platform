import React, { useEffect, useState } from "react";
import styles from "./DashBoard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faChalkboardTeacher,
  faCrown,
  faCoins,
  faRobot,
  faCheckCircle,
  faChevronRight,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import paymentService from "../../../services/paymentService";
import listeningLessonService from "../../../services/listeningLessonService";

function DashBoard() {
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState("30days");
  const [activeChartTooltip, setActiveChartTooltip] = useState(null);

  // ===== Recent purchases (real data) =====
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  // ===== Pending lessons (real data) =====
  const [pendingLessons, setPendingLessons] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  useEffect(() => {
    const fetchRecentPurchases = async () => {
      try {
        setPurchasesLoading(true);

        const res = await paymentService.getPaymentHistory({
          page: 0,
          size: 5,
          sortBy: "createdAt",
          direction: "desc",
        });

        setRecentPurchases(res.data?.data?.content ?? []);
      } catch (err) {
        console.error("Lỗi khi lấy giao dịch gần đây:", err);
        setRecentPurchases([]);
      } finally {
        setPurchasesLoading(false);
      }
    };

    const fetchPendingLessons = async () => {
      try {
        setPendingLoading(true);

        const res = await listeningLessonService.getByStatus("PENDING");
        setPendingLessons(res.data?.data ?? []);
      } catch (err) {
        console.error("Lỗi khi lấy bài chờ duyệt:", err);
        setPendingLessons([]);
      } finally {
        setPendingLoading(false);
      }
    };

    fetchRecentPurchases();
    fetchPendingLessons();
  }, []);

  // Mock statistics based on platform features
  const stats = [
    {
      id: "users",
      label: "Tổng học viên",
      value: "1,248",
      growth: "+12.4%",
      isPositive: true,
      icon: faUsers,
      color: "#0ea792",
    },
    {
      id: "teachers",
      label: "Giáo viên",
      value: "42",
      growth: "+5.2%",
      isPositive: true,
      icon: faChalkboardTeacher,
      color: "#3b82f6",
    },
    {
      id: "vip",
      label: "Gói VIP đã bán",
      value: "382",
      growth: "+18.7%",
      isPositive: true,
      icon: faCrown,
      color: "#f59e0b",
    },
    {
      id: "revenue",
      label: "Doanh thu tháng",
      value: "45.8Mđ",
      growth: "+14.2%",
      isPositive: true,
      icon: faCoins,
      color: "#10b981",
    },
    {
      id: "ai",
      label: "Lượt gọi Gemini API",
      value: "18,492",
      growth: "+32.1%",
      isPositive: true,
      icon: faRobot,
      color: "#8b5cf6",
    },
  ];

  // SVG Chart data: Revenue trend for past 6 months
  const monthlyRevenueData = [
    { month: "Tháng 3", revenue: 22, activeUsers: 640 },
    { month: "Tháng 4", revenue: 28, activeUsers: 780 },
    { month: "Tháng 5", revenue: 35, activeUsers: 920 },
    { month: "Tháng 6", revenue: 31, activeUsers: 890 },
    { month: "Tháng 7", revenue: 40, activeUsers: 1100 },
    { month: "Tháng 8", revenue: 45.8, activeUsers: 1248 },
  ];

  // SVG Chart data: Study activities
  const studyActivities = [
    { name: "Luyện nghe", value: 342, color: "#0ea792" },
    { name: "Dịch bằng AI", value: 584, color: "#8b5cf6" },
    { name: "Học từ vựng", value: 412, color: "#f59e0b" },
  ];

  // Navigate to lesson detail
  const handleGoToLessonDetail = (lesson) => {
    navigate(
      `/dashboard/admin/topics/${lesson.topicId}/listening-lessons/${lesson.id}`,
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tổng quan hệ thống</h1>
          <p className={styles.subtitle}>
            Chào mừng Admin! Theo dõi tình hình hoạt động và duyệt bài hôm nay.
          </p>
        </div>
        <div className={styles.actions}>
          <div className={styles.dateSelector}>
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className={styles.calendarIcon}
            />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={styles.select}
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.id} className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>{s.label}</span>
              <div
                className={styles.statIcon}
                style={{ backgroundColor: `${s.color}15`, color: s.color }}
              >
                <FontAwesomeIcon icon={s.icon} />
              </div>
            </div>
            <div className={styles.statBody}>
              <h2 className={styles.statValue}>{s.value}</h2>
              <span
                className={`${styles.statGrowth} ${
                  s.isPositive ? styles.growthPositive : styles.growthNegative
                }`}
              >
                {s.growth}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Area Line Chart for Revenue */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Xu hướng doanh thu</h3>
              <p className={styles.chartSubtitle}>
                Thống kê doanh thu theo tháng (Đơn vị: Triệu VNĐ)
              </p>
            </div>
          </div>
          <div className={styles.chartBody}>
            <div className={styles.svgContainer}>
              <svg viewBox="0 0 500 200" className={styles.lineChartSvg}>
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0ea792" stopOpacity="0.4" />
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

                <text x="15" y="34" className={styles.svgText}>
                  50M
                </text>
                <text x="15" y="84" className={styles.svgText}>
                  30M
                </text>
                <text x="15" y="134" className={styles.svgText}>
                  15M
                </text>
                <text x="15" y="174" className={styles.svgText}>
                  0
                </text>

                <path
                  d="M 40 170 L 40 94.8 L 128 74.4 L 216 50.4 L 304 64 L 392 36 L 480 18.2 L 480 170 Z"
                  fill="url(#chartGradient)"
                />

                <path
                  d="M 40 94.8 L 128 74.4 L 216 50.4 L 304 64 L 392 36 L 480 18.2"
                  fill="none"
                  stroke="#0ea792"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {monthlyRevenueData.map((item, index) => {
                  const xPositions = [40, 128, 216, 304, 392, 480];
                  const yPositions = [94.8, 74.4, 50.4, 64, 36, 18.2];
                  const cx = xPositions[index];
                  const cy = yPositions[index];

                  return (
                    <g key={index}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="#ffffff"
                        stroke="#0ea792"
                        strokeWidth="3"
                        className={styles.chartPoint}
                        onMouseEnter={() =>
                          setActiveChartTooltip({
                            x: cx,
                            y: cy - 15,
                            text: `${item.month}: ${item.revenue} triệu`,
                          })
                        }
                        onMouseLeave={() => setActiveChartTooltip(null)}
                      />
                      <text
                        x={cx}
                        y="190"
                        textAnchor="middle"
                        className={styles.svgText}
                      >
                        {item.month}
                      </text>
                    </g>
                  );
                })}

                {activeChartTooltip && (
                  <g>
                    <rect
                      x={activeChartTooltip.x - 70}
                      y={activeChartTooltip.y - 25}
                      width="140"
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
          </div>
        </div>

        {/* Study Activity Metrics */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Hoạt động học tập</h3>
              <p className={styles.chartSubtitle}>
                Thống kê số lượng bài hoàn thành theo kỹ năng (tuần qua)
              </p>
            </div>
          </div>
          <div className={styles.chartBody}>
            <div className={styles.activitiesContainer}>
              {studyActivities.map((act) => (
                <div key={act.name} className={styles.activityRow}>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityName}>{act.name}</span>
                    <span className={styles.activityValue}>
                      {act.value} bài
                    </span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{
                        width: `${(act.value / 600) * 100}%`,
                        backgroundColor: act.color,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className={styles.aiTip}>
                <FontAwesomeIcon icon={faRobot} className={styles.tipIcon} />
                <span>
                  Lượt luyện dịch tiếng Anh bằng <strong>Gemini AI</strong>{" "}
                  chiếm 43% tổng số bài làm.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Bottom Lists */}
      <div className={styles.detailsGrid}>
        {/* Content Approvals Panel */}
        <div className={styles.detailsCard}>
          <div className={styles.detailsHeader}>
            <h3 className={styles.detailsTitle}>Yêu cầu duyệt nội dung</h3>
            <span className={styles.badge}>
              {pendingLessons.length} chờ duyệt
            </span>
          </div>

          {pendingLoading ? (
            <div className={styles.emptyList}>
              <p>Đang tải danh sách chờ duyệt...</p>
            </div>
          ) : pendingLessons.length === 0 ? (
            <div className={styles.emptyList}>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.emptyIcon}
              />
              <p>Đã duyệt hết bài. Không có bài học nào chờ xử lý.</p>
            </div>
          ) : (
            <div className={styles.listWrapper}>
              {pendingLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={styles.listItem}
                  onClick={() => handleGoToLessonDetail(lesson)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.listItemLeft}>
                    <h4 className={styles.itemTitle}>{lesson.title}</h4>
                    <div className={styles.itemMeta}>
                      <span>
                        Gửi bởi: <strong>{lesson.createdByName}</strong>
                      </span>
                      {lesson.levelName && (
                        <>
                          <span className={styles.metaDot}>•</span>
                          <span>
                            Cấp độ:{" "}
                            <span className={styles.levelTag}>
                              {lesson.levelName}
                            </span>
                          </span>
                        </>
                      )}
                      {lesson.topicTitle && (
                        <>
                          <span className={styles.metaDot}>•</span>
                          <span className={styles.typeTag}>
                            {lesson.topicTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToLessonDetail(lesson);
                      }}
                      className={styles.approveBtn}
                      title="Xem chi tiết"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent VIP Purchases */}
        <div className={styles.detailsCard}>
          <div className={styles.detailsHeader}>
            <h3 className={styles.detailsTitle}>Giao dịch VIP gần đây</h3>
            <button
              className={styles.viewMoreBtn}
              onClick={() => navigate("/dashboard/admin/payment-history")}
            >
              Xem thêm <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className={styles.tableWrapper}>
            {purchasesLoading ? (
              <div className={styles.emptyList}>
                <p>Đang tải giao dịch...</p>
              </div>
            ) : recentPurchases.length === 0 ? (
              <div className={styles.emptyList}>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className={styles.emptyIcon}
                />
                <p>Chưa có giao dịch nào.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã giao dịch</th>
                    <th>Người dùng</th>
                    <th>Gói mua</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className={styles.txId}>{p.id}</span>
                      </td>
                      <td>
                        <span className={styles.txUser}>
                          {p.userName || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.vipPackage}>
                          {p.packageName || "—"}
                        </span>
                      </td>
                      <td>
                        <strong className={styles.txAmount}>
                          {Number(p.paidPrice || 0).toLocaleString("vi-VN")}đ
                        </strong>
                      </td>
                      <td>
                        <span
                          className={
                            p.status === "ACTIVE"
                              ? styles.txSuccessBadge
                              : styles.txExpiredBadge
                          }
                        >
                          {p.status === "ACTIVE"
                            ? "Đang hoạt động"
                            : "Đã hết hạn"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
