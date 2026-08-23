import React, { useState } from "react";
import styles from "./DashBoard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faChalkboardTeacher,
  faCrown,
  faCoins,
  faRobot,
  faCheckCircle,
  faTimesCircle,
  faChevronRight,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

function DashBoard() {
  const [timeRange, setTimeRange] = useState("30days");
  const [activeChartTooltip, setActiveChartTooltip] = useState(null);

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

  // Pending content approval from teachers
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      title: "Chủ đề: Giao tiếp tại sân bay",
      teacher: "Nguyễn Văn A",
      level: "A2",
      type: "Luyện dịch AI",
      date: "23/08/2026",
    },
    {
      id: 2,
      title: "Bài nghe: Cuộc hẹn cuối tuần",
      teacher: "Trần Thị B",
      level: "B1",
      type: "Luyện nghe",
      date: "22/08/2026",
    },
    {
      id: 3,
      title: "Chủ đề: Phỏng vấn xin việc ngành IT",
      teacher: "Lê Hoàng C",
      level: "B2",
      type: "Luyện dịch AI",
      date: "22/08/2026",
    },
  ]);

  const handleApprove = (id) => {
    setApprovals(approvals.filter((app) => app.id !== id));
  };

  const handleReject = (id) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn từ chối bài đăng này?");
    if (confirmed) {
      setApprovals(approvals.filter((app) => app.id !== id));
    }
  };

  // Recent purchases
  const recentPurchases = [
    {
      id: "TX9021",
      user: "Đinh Quốc Đạt",
      package: "VIP 1 Năm",
      amount: "699,000đ",
      date: "23/08/2026 09:12",
      status: "Thành công",
    },
    {
      id: "TX9020",
      user: "Phạm Minh Thư",
      package: "VIP 6 Tháng",
      amount: "399,000đ",
      date: "23/08/2026 08:45",
      status: "Thành công",
    },
    {
      id: "TX9019",
      user: "Hoàng Anh Tuấn",
      package: "VIP 1 Tháng",
      amount: "89,000đ",
      date: "22/08/2026 19:30",
      status: "Thành công",
    },
  ];

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
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.calendarIcon} />
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
            {/* Interactive SVG Area Chart */}
            <div className={styles.svgContainer}>
              <svg viewBox="0 0 500 200" className={styles.lineChartSvg}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea792" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0ea792" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1" />

                {/* Y-axis Labels */}
                <text x="15" y="34" className={styles.svgText}>50M</text>
                <text x="15" y="84" className={styles.svgText}>30M</text>
                <text x="15" y="134" className={styles.svgText}>15M</text>
                <text x="15" y="174" className={styles.svgText}>0</text>

                {/* Area under the line */}
                <path
                  d="M 40 170 L 40 94.8 L 128 74.4 L 216 50.4 L 304 64 L 392 36 L 480 18.2 L 480 170 Z"
                  fill="url(#chartGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 40 94.8 L 128 74.4 L 216 50.4 L 304 64 L 392 36 L 480 18.2"
                  fill="none"
                  stroke="#0ea792"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
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

                {/* Tooltip Overlay inside SVG */}
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

        {/* Study Activity Metrics (Bar chart layout) */}
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
                    <span className={styles.activityValue}>{act.value} bài</span>
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
                  Lượt luyện dịch tiếng Anh bằng <strong>Gemini AI</strong> chiếm 43%
                  tổng số bài làm.
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
            <span className={styles.badge}>{approvals.length} chờ duyệt</span>
          </div>
          {approvals.length === 0 ? (
            <div className={styles.emptyList}>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.emptyIcon} />
              <p>Đã duyệt hết bài. Không có bài học nào chờ xử lý.</p>
            </div>
          ) : (
            <div className={styles.listWrapper}>
              {approvals.map((app) => (
                <div key={app.id} className={styles.listItem}>
                  <div className={styles.listItemLeft}>
                    <h4 className={styles.itemTitle}>{app.title}</h4>
                    <div className={styles.itemMeta}>
                      <span>Gửi bởi: <strong>{app.teacher}</strong></span>
                      <span className={styles.metaDot}>•</span>
                      <span>Cấp độ: <span className={styles.levelTag}>{app.level}</span></span>
                      <span className={styles.metaDot}>•</span>
                      <span className={styles.typeTag}>{app.type}</span>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      onClick={() => handleApprove(app.id)}
                      className={styles.approveBtn}
                      title="Duyệt xuất bản"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className={styles.rejectBtn}
                      title="Từ chối"
                    >
                      Từ chối
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
            <button className={styles.viewMoreBtn}>
              Xem thêm <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className={styles.tableWrapper}>
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
                    <td><span className={styles.txId}>{p.id}</span></td>
                    <td><span className={styles.txUser}>{p.user}</span></td>
                    <td><span className={styles.vipPackage}>{p.package}</span></td>
                    <td><strong className={styles.txAmount}>{p.amount}</strong></td>
                    <td>
                      <span className={styles.txSuccessBadge}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
