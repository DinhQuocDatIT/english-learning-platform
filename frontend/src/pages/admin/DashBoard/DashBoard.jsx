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
import statisticsService from "../../../services/statisticsService";

// ===== HELPERS: Format tiền VNĐ =====
const formatVNDNumber = (value) => {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value || 0));
};

const formatAxisVND = (value) => {
  return formatVNDNumber(value);
};

// ===== HELPERS: Tính khoảng ngày theo năm =====
/**
 * Tính fromDate / toDate theo năm được chọn
 * @param {number} year - ví dụ 2026
 */
const getDateRangeForYear = (year) => {
  const fromDate = `${year}-01-01`;
  const toDate = `${year}-12-31`;

  return {
    fromDate,
    toDate,
    groupBy: "month", // luôn group theo tháng
  };
};

/**
 * Format "2026-01-01" → "01/01/2026"
 */
const formatDateShort = (isoDate) => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
};

function DashBoard() {
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeChartTooltip, setActiveChartTooltip] = useState(null);

  // ===== Recent purchases =====
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  // ===== Pending lessons =====
  const [pendingLessons, setPendingLessons] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // ===== Revenue trend =====
  const [revenueTrend, setRevenueTrend] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  // ===== Study activities =====
  const [studyActivities, setStudyActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // ===== Overview stats =====
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // ===== Danh sách năm cho dropdown =====
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // [2024, 2025, 2026, 2027, 2028]

  // ===== Fetch 1 lần: purchases, pending, activities, overview =====
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

    const fetchStudyActivities = async () => {
      try {
        setActivitiesLoading(true);

        const res = await statisticsService.getStudyActivities();
        setStudyActivities(res.data?.data?.activities ?? []);
      } catch (err) {
        console.error("Lỗi khi lấy hoạt động học tập:", err);
        setStudyActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };

    const fetchOverview = async () => {
      try {
        setOverviewLoading(true);

        const res = await statisticsService.getOverview();
        setOverview(res.data?.data ?? null);
      } catch (err) {
        console.error("Lỗi khi lấy tổng quan:", err);
        setOverview(null);
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchRecentPurchases();
    fetchPendingLessons();
    fetchStudyActivities();
    fetchOverview();
  }, []);

  // ===== Fetch revenue trend riêng — refetch khi đổi năm =====
  useEffect(() => {
    const fetchRevenueTrend = async () => {
      try {
        setRevenueLoading(true);

        const { fromDate, toDate, groupBy } = getDateRangeForYear(selectedYear);

        const res = await statisticsService.getRevenueTrend({
          fromDate,
          toDate,
          groupBy,
        });

        setRevenueTrend(res.data?.data ?? null);
      } catch (err) {
        console.error("Lỗi khi lấy xu hướng doanh thu:", err);
        setRevenueTrend(null);
      } finally {
        setRevenueLoading(false);
      }
    };

    fetchRevenueTrend();
  }, [selectedYear]);

  // ===== Stats cards =====
  const stats = [
    {
      id: "users",
      label: "Tổng học viên",
      value: overviewLoading
        ? "..."
        : Number(overview?.totalStudents || 0).toLocaleString("vi-VN"),
      icon: faUsers,
      color: "#0ea792",
    },
    {
      id: "teachers",
      label: "Giáo viên",
      value: overviewLoading
        ? "..."
        : Number(overview?.totalTeachers || 0).toLocaleString("vi-VN"),
      icon: faChalkboardTeacher,
      color: "#3b82f6",
    },
    {
      id: "vip",
      label: "Gói VIP đã bán",
      value: overviewLoading
        ? "..."
        : Number(overview?.vipSold || 0).toLocaleString("vi-VN"),
      icon: faCrown,
      color: "#f59e0b",
    },
    {
      id: "revenue",
      label: "Tổng doanh thu",
      value: overviewLoading
        ? "..."
        : `${formatVNDNumber(overview?.totalRevenue)}đ`,
      icon: faCoins,
      color: "#10b981",
    },
    {
      id: "ai",
      label: "Lượt gọi Gemini API",
      value: overviewLoading
        ? "..."
        : Number(overview?.totalAIRequests || 0).toLocaleString("vi-VN"),
      icon: faRobot,
      color: "#8b5cf6",
    },
  ];

  // ===== Chart doanh thu =====
  const buildChartPoints = (points) => {
    if (!points || points.length === 0) return [];

    const CHART_LEFT = 40;
    const CHART_RIGHT = 480;
    const CHART_TOP = 20;
    const CHART_BOTTOM = 170;

    const chartWidth = CHART_RIGHT - CHART_LEFT;
    const chartHeight = CHART_BOTTOM - CHART_TOP;

    const revenuesInMillions = points.map((p) => Number(p.revenue) / 1_000_000);

    const maxRevenue = Math.max(...revenuesInMillions, 1);
    const yMax = maxRevenue * 1.2;

    const N = points.length;

    return points.map((p, index) => {
      let x;
      if (N === 1) {
        x = (CHART_LEFT + CHART_RIGHT) / 2;
      } else {
        x = CHART_LEFT + (index * chartWidth) / (N - 1);
      }

      const valueInMillions = revenuesInMillions[index];
      const y = CHART_BOTTOM - (valueInMillions / yMax) * chartHeight;

      return {
        x,
        y,
        label: p.label,
        period: p.period,
        value: valueInMillions,
        rawRevenue: Number(p.revenue),
        transactions: p.transactions,
      };
    });
  };

  const buildChartPaths = (chartPoints) => {
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

  const chartPoints = revenueTrend?.points
    ? buildChartPoints(revenueTrend.points)
    : [];
  const { linePath, areaPath } = buildChartPaths(chartPoints);

  const maxRevenueInMillions =
    chartPoints.length > 0
      ? Math.max(...chartPoints.map((p) => p.value)) * 1.2
      : 50;

  const yAxisLabels = [
    { value: maxRevenueInMillions * 1_000_000, y: 34 },
    { value: maxRevenueInMillions * 0.6 * 1_000_000, y: 84 },
    { value: maxRevenueInMillions * 0.3 * 1_000_000, y: 134 },
    { value: 0, y: 174 },
  ];

  // ===== Study activities =====
  const maxActivityValue = Math.max(...studyActivities.map((a) => a.value), 1);

  const totalListeningLessons = studyActivities
    .filter((a) => a.key !== "ai-translate")
    .reduce((sum, a) => sum + a.value, 0);

  const totalAIPractice =
    studyActivities.find((a) => a.key === "ai-translate")?.value ?? 0;

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
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* ===== Revenue Trend Chart ===== */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Xu hướng doanh thu</h3>
              <p className={styles.chartSubtitle}>
                {revenueTrend
                  ? `Từ ${formatDateShort(revenueTrend.fromDate)} đến ${formatDateShort(revenueTrend.toDate)} (Đơn vị: VNĐ)`
                  : "Đang tải..."}
              </p>
            </div>

            {/* ===== Dropdown chọn năm ===== */}
            <div className={styles.yearSelector}>
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className={styles.calendarIcon}
              />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={styles.select}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.chartBody}>
            {revenueLoading ? (
              <div className={styles.chartPlaceholder}>Đang tải dữ liệu...</div>
            ) : chartPoints.length === 0 ? (
              <div className={styles.chartPlaceholder}>
                Chưa có dữ liệu doanh thu
              </div>
            ) : (
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

                  {/* Grid Lines */}
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

                  {/* Y-axis Labels */}
                  {yAxisLabels.map((lbl, i) => (
                    <text key={i} x="15" y={lbl.y} className={styles.svgText}>
                      {formatAxisVND(lbl.value)}
                    </text>
                  ))}

                  {/* Area */}
                  {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

                  {/* Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#0ea792"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Points */}
                  {chartPoints.map((item, index) => (
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
                            text: `${item.label}: ${formatVNDNumber(
                              item.rawRevenue,
                            )} VNĐ`,
                          })
                        }
                        onMouseLeave={() => setActiveChartTooltip(null)}
                      />
                      <text
                        x={item.x}
                        y="190"
                        textAnchor="middle"
                        className={styles.svgText}
                      >
                        {item.label}
                      </text>
                    </g>
                  ))}

                  {/* Tooltip */}
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
        </div>

        {/* ===== Study Activities ===== */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Hoạt động học tập</h3>
              <p className={styles.chartSubtitle}>
                Thống kê bài nghe theo trạng thái và lượt dịch AI
              </p>
            </div>
          </div>
          <div className={styles.chartBody}>
            {activitiesLoading ? (
              <div className={styles.chartPlaceholder}>Đang tải dữ liệu...</div>
            ) : studyActivities.length === 0 ? (
              <div className={styles.chartPlaceholder}>
                Chưa có dữ liệu hoạt động
              </div>
            ) : (
              <div className={styles.activitiesContainer}>
                {studyActivities.map((act) => {
                  const percentage =
                    maxActivityValue > 0
                      ? (act.value / maxActivityValue) * 100
                      : 0;

                  return (
                    <div key={act.key} className={styles.activityRow}>
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
                            width: `${percentage}%`,
                            backgroundColor: act.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className={styles.aiTip}>
                  <FontAwesomeIcon icon={faRobot} className={styles.tipIcon} />
                  <span>
                    Hệ thống có{" "}
                    <strong>{totalListeningLessons} bài nghe</strong> và{" "}
                    <strong>{totalAIPractice} phiên</strong> luyện dịch AI.
                  </span>
                </div>
              </div>
            )}
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
                          {formatVNDNumber(p.paidPrice)}đ
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
