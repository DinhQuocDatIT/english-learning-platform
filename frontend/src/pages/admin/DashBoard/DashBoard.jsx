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

/**
 * Format VNĐ đầy đủ, có dấu chấm phân cách
 * 1398000 → "1.398.000"
 */
const formatVNDNumber = (value) => {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value || 0));
};

/**
 * Format VNĐ cho trục Y — hiện đầy đủ, tự động rút gọn đơn vị
 * 1398000     → "1.398.000"
 * 45800000    → "45.800.000"
 * 1500000000  → "1.500.000.000"
 */
const formatAxisVND = (value) => {
  return formatVNDNumber(value);
};

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

  // ===== Revenue trend (real data) =====
  const [revenueTrend, setRevenueTrend] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

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

    const fetchRevenueTrend = async () => {
      try {
        setRevenueLoading(true);

        const res = await statisticsService.getRevenueTrend({
          groupBy: "month",
        });

        setRevenueTrend(res.data?.data ?? null);
      } catch (err) {
        console.error("Lỗi khi lấy xu hướng doanh thu:", err);
        setRevenueTrend(null);
      } finally {
        setRevenueLoading(false);
      }
    };

    fetchRecentPurchases();
    fetchPendingLessons();
    fetchRevenueTrend();
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

  // ===== Tính toán điểm cho chart doanh thu =====

  /**
   * Chuyển data từ API thành toạ độ SVG
   */
  const buildChartPoints = (points) => {
    if (!points || points.length === 0) return [];

    const CHART_LEFT = 40;
    const CHART_RIGHT = 480;
    const CHART_TOP = 20;
    const CHART_BOTTOM = 170;

    const chartWidth = CHART_RIGHT - CHART_LEFT;
    const chartHeight = CHART_BOTTOM - CHART_TOP;

    // Đơn vị: VNĐ → triệu VNĐ (dùng để tính toạ độ, không dùng để hiển thị)
    const revenuesInMillions = points.map((p) => Number(p.revenue) / 1_000_000);

    const maxRevenue = Math.max(...revenuesInMillions, 1); // tránh chia 0
    const yMax = maxRevenue * 1.2; // dư 20%

    const N = points.length;

    return points.map((p, index) => {
      // X position
      let x;
      if (N === 1) {
        x = (CHART_LEFT + CHART_RIGHT) / 2; // giữa
      } else {
        x = CHART_LEFT + (index * chartWidth) / (N - 1);
      }

      // Y position
      const valueInMillions = revenuesInMillions[index];
      const y = CHART_BOTTOM - (valueInMillions / yMax) * chartHeight;

      return {
        x,
        y,
        label: p.label,
        period: p.period,
        value: valueInMillions,
        rawRevenue: Number(p.revenue), // VNĐ gốc
        transactions: p.transactions,
      };
    });
  };

  /**
   * Tạo SVG path cho đường line + area
   */
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

  // Y-axis labels động — giá trị VNĐ gốc
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

  // ===== Handle xong =====

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
        {/* ===== Revenue Trend Chart ===== */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Xu hướng doanh thu</h3>
              <p className={styles.chartSubtitle}>
                Thống kê doanh thu theo tháng (Đơn vị: VNĐ)
              </p>
            </div>
          </div>
          <div className={styles.chartBody}>
            {revenueLoading ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Đang tải dữ liệu...
              </div>
            ) : chartPoints.length === 0 ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
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

                  {/* Y-axis Labels - hiện đầy đủ VNĐ */}
                  {yAxisLabels.map((lbl, i) => (
                    <text key={i} x="15" y={lbl.y} className={styles.svgText}>
                      {formatAxisVND(lbl.value)}
                    </text>
                  ))}

                  {/* Area under the line */}
                  {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

                  {/* Line Path */}
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

                  {/* Interactive Points */}
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
                Thống kê số lượng bài hoàn thành theo kỹ năng (tuần qua)
              </p>
            </div>
          </div>
          <div className={styles.chartBody}>
            <div className={styles.activitiesContainer}>
              {[
                { name: "Luyện nghe", value: 342, color: "#0ea792" },
                { name: "Dịch bằng AI", value: 584, color: "#8b5cf6" },
                { name: "Học từ vựng", value: 412, color: "#f59e0b" },
              ].map((act) => (
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
