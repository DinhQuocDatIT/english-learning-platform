// frontend/src/pages/admin/AIUsage/components/StatsTab.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  faCoins,
  faChartLine,
  faSpinner,
  faCalendarAlt,
  faCheckCircle,
  faXmarkCircle,
  faUserGroup,
  faRobot,
  faCrown,
  faArrowTrendUp,
  faBolt,
  faCircleDollarToSlot,
  faGaugeHigh,
  faLayerGroup,
  faBrain,
  faClock,
  faFire,
  faArrowUp,
  faArrowDown,
  faMinus,
  faDatabase,
  faWallet,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

import aiUsageService from "../../services/aiUsageService";

import styles from "./StatsTab.module.css";

function StatsTab({ from, to }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatistics = async () => {
    if (!from || !to) return;

    try {
      setLoading(true);
      const params = { from, to };

      const [
        overviewRes,
        timelineRes,
        requestTypeRes,
        modelRes,
        costRes,
        performanceRes,
        topStudentsRes,
      ] = await Promise.all([
        aiUsageService.getOverview(params),
        aiUsageService.getTimeline(params),
        aiUsageService.getByRequestType(params),
        aiUsageService.getByModel(params),
        aiUsageService.getCost(params),
        aiUsageService.getPerformance(params),
        aiUsageService.getTopStudents({ ...params, limit: 5 }),
      ]);

      setDashboard({
        overview: overviewRes?.data?.data || {},
        timeline: timelineRes?.data?.data || [],
        byRequestType: requestTypeRes?.data?.data || [],
        byModel: modelRes?.data?.data || [],
        cost: costRes?.data?.data || {},
        performance: performanceRes?.data?.data || {},
        topStudents: topStudentsRes?.data?.data || [],
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê AI Usage:", error);
      setDashboard(null);
      toast.error(error?.response?.data?.message || "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [from, to]);

  const overview = dashboard?.overview || {};
  const timeline = dashboard?.timeline || [];
  const byRequestType = dashboard?.byRequestType || [];
  const byModel = dashboard?.byModel || [];
  const cost = dashboard?.cost || {};
  const performance = dashboard?.performance || {};
  const topStudents = dashboard?.topStudents || [];

  const maxDailyRequests = useMemo(() => {
    if (!timeline.length) return 0;
    return Math.max(...timeline.map((item) => Number(item.requests || 0)));
  }, [timeline]);

  const maxDailyCost = useMemo(() => {
    if (!timeline.length) return 0;
    return Math.max(...timeline.map((item) => Number(item.estimatedCost || 0)));
  }, [timeline]);

  const totalModelRequests = useMemo(() => {
    return byModel.reduce((sum, item) => sum + Number(item.requests || 0), 0);
  }, [byModel]);

  const totalRequestTypeRequests = useMemo(() => {
    return byRequestType.reduce(
      (sum, item) => sum + Number(item.requests || 0),
      0,
    );
  }, [byRequestType]);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return Number(num).toLocaleString("vi-VN");
  };

  const formatDecimal = (num, digits = 1) => {
    if (num === undefined || num === null || Number.isNaN(Number(num)))
      return "0";
    return Number(num).toLocaleString("vi-VN", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const formatUSD = (amount) => {
    if (!amount || Number(amount) === 0) return "$0";
    return `$${Number(amount).toFixed(4)}`;
  };

  const formatVND = (amount) => {
    if (!amount || Number(amount) === 0) return "0₫";
    const vnd = Number(amount) * 25000;
    if (vnd >= 1000) {
      return `${Math.round(vnd / 1000)}k₫`;
    }
    return `${Math.round(vnd)}₫`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  const formatMs = (ms) => {
    if (!ms) return "0ms";
    const val = Number(ms);
    if (val >= 1000) return `${(val / 1000).toFixed(1)}s`;
    return `${Math.round(val)}ms`;
  };

  const getPct = (value, total) => {
    if (!total || Number(total) === 0) return 0;
    return (Number(value || 0) / Number(total)) * 100;
  };

  const clampPct = (v) => Math.min(Math.max(Number(v || 0), 0), 100);

  const statCards = [
    {
      icon: faChartLine,
      color: "#0ea792",
      bgColor: "rgba(14, 167, 146, 0.12)",
      label: "Tổng requests",
      value: formatNumber(overview.totalRequests),
      sub: `${formatNumber(overview.successfulRequests)} thành công`,
    },
    {
      icon: faLayerGroup,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.12)",
      label: "Total tokens",
      value: formatNumber(overview.totalTokens),
      sub: `In: ${formatNumber(overview.totalInputTokens)} · Out: ${formatNumber(overview.totalOutputTokens)}`,
    },
    {
      icon: faWallet,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.12)",
      label: "Tổng chi phí",
      value: formatVND(overview.totalEstimatedCost),
      sub: formatUSD(overview.totalEstimatedCost),
    },
    {
      icon: faGaugeHigh,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.12)",
      label: "Response time",
      value: formatMs(overview.averageResponseTimeMs),
      sub: `${formatMs(overview.fastestResponseTimeMs)} · ${formatMs(overview.slowestResponseTimeMs)}`,
    },
  ];

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loading}>
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      {/* <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeDot} />
            <span>AI ANALYTICS</span>
          </div>
          <h1 className={styles.headerTitle}>Thống kê sử dụng AI</h1>
          <p className={styles.headerSub}>
            Tổng quan request, token, chi phí & hiệu năng
          </p>
        </div>
        <div className={styles.headerChip}>
          <FontAwesomeIcon icon={faRobot} />
          <span>AI Monitoring</span>
        </div>
      </div> */}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} className={styles.statCard}>
            <div
              className={styles.statIconWrapper}
              style={{ background: card.bgColor }}
            >
              <FontAwesomeIcon icon={card.icon} style={{ color: card.color }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statSub}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Stats */}
      <div className={styles.miniStats}>
        <div className={styles.miniStat}>
          <div
            className={styles.miniStatDot}
            style={{ background: "#22c55e" }}
          />
          <span className={styles.miniStatLabel}>Thành công</span>
          <span className={styles.miniStatValue}>
            {formatNumber(overview.successfulRequests)}
          </span>
        </div>
        <div className={styles.miniStat}>
          <div
            className={styles.miniStatDot}
            style={{ background: "#ef4444" }}
          />
          <span className={styles.miniStatLabel}>Thất bại</span>
          <span className={styles.miniStatValue}>
            {formatNumber(overview.failedRequests)}
          </span>
        </div>
        <div className={styles.miniStat}>
          <div
            className={styles.miniStatDot}
            style={{ background: "#6366f1" }}
          />
          <span className={styles.miniStatLabel}>Học viên</span>
          <span className={styles.miniStatValue}>
            {formatNumber(overview.activeStudents)}
          </span>
        </div>
        <div className={styles.miniStat}>
          <div
            className={styles.miniStatDot}
            style={{ background: "#0ea792" }}
          />
          <span className={styles.miniStatLabel}>Tỷ lệ thành công</span>
          <span className={styles.miniStatValue}>
            {formatDecimal(overview.successRate, 1)}%
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <div className={styles.cardIconWrapper}>
              <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <div>
              <h3>Hoạt động theo ngày</h3>
              <p>Request và chi phí theo từng ngày</p>
            </div>
          </div>
          <div className={styles.cardBadge}>
            <span className={styles.cardBadgeNumber}>
              {formatNumber(overview.totalRequests)}
            </span>
            <span>requests</span>
          </div>
        </div>

        {timeline.length > 0 ? (
          <div className={styles.timelineWrapper}>
            <div className={styles.timelineYAxis}>
              <span>{formatNumber(maxDailyRequests)}</span>
              <span>{formatNumber(Math.round(maxDailyRequests / 2))}</span>
              <span>0</span>
            </div>
            <div className={styles.timelineBars}>
              {timeline.map((day) => {
                const req = Number(day.requests || 0);
                const cst = Number(day.estimatedCost || 0);
                const reqH =
                  maxDailyRequests > 0 ? (req / maxDailyRequests) * 100 : 0;
                const cstH = maxDailyCost > 0 ? (cst / maxDailyCost) * 100 : 0;
                return (
                  <div className={styles.barGroup} key={day.date}>
                    <div className={styles.barWrapper}>
                      <div className={styles.barTooltip}>
                        <span>{formatNumber(req)} requests</span>
                        <span>{formatVND(cst)}</span>
                      </div>
                      <div
                        className={styles.barReq}
                        style={{
                          height: `${Math.max(reqH, req > 0 ? 8 : 0)}%`,
                        }}
                      />
                      <div
                        className={styles.barCost}
                        style={{
                          height: `${Math.max(cstH, cst > 0 ? 8 : 0)}%`,
                        }}
                      />
                    </div>
                    <span className={styles.barLabel}>
                      {formatDate(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.empty}>Chưa có dữ liệu</div>
        )}

        <div className={styles.legend}>
          <span>
            <span
              className={styles.legendDot}
              style={{ background: "#0ea792" }}
            />
            Requests
          </span>
          <span>
            <span
              className={styles.legendDot}
              style={{ background: "#f59e0b" }}
            />
            Cost
          </span>
        </div>
      </div>

      {/* Two Columns: Models & Request Types */}
      <div className={styles.twoCol}>
        {/* Models */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <div className={styles.cardIconWrapper}>
                <FontAwesomeIcon icon={faMicrochip} />
              </div>
              <div>
                <h3>Models</h3>
                <p>Phân bổ theo model</p>
              </div>
            </div>
          </div>
          {byModel.length > 0 ? (
            <div className={styles.modelList}>
              {byModel.map((item, i) => {
                const pct = getPct(item.requests, totalModelRequests);
                return (
                  <div className={styles.modelItem} key={i}>
                    <div className={styles.modelHeader}>
                      <div className={styles.modelInfo}>
                        <div className={styles.modelIcon}>
                          <FontAwesomeIcon icon={faRobot} />
                        </div>
                        <div>
                          <span className={styles.modelName}>{item.model}</span>
                          <span className={styles.modelProvider}>
                            {item.provider}
                          </span>
                        </div>
                      </div>
                      <span className={styles.modelCost}>
                        {formatVND(item.estimatedCost)}
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${clampPct(pct)}%` }}
                      />
                    </div>
                    <div className={styles.modelStats}>
                      <span>{formatNumber(item.requests)} req</span>
                      <span>{formatDecimal(pct, 1)}%</span>
                      <span>{formatNumber(item.totalTokens)} tokens</span>
                      <span className={styles.successText}>
                        {formatDecimal(item.successRate, 1)}% success
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>Chưa có dữ liệu</div>
          )}
        </div>

        {/* Request Types */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <div className={styles.cardIconWrapper}>
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <div>
                <h3>Loại request</h3>
                <p>Phân bổ theo loại</p>
              </div>
            </div>
          </div>
          {byRequestType.length > 0 ? (
            <div className={styles.requestList}>
              {byRequestType.map((item, i) => {
                const pct = getPct(item.requests, totalRequestTypeRequests);
                return (
                  <div className={styles.requestItem} key={i}>
                    <div className={styles.requestHeader}>
                      <div className={styles.requestInfo}>
                        <span className={styles.requestIndex}>#{i + 1}</span>
                        <span className={styles.requestType}>
                          {item.requestType}
                        </span>
                      </div>
                      <span className={styles.requestCount}>
                        {formatNumber(item.requests)}
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${clampPct(pct)}%`,
                          background:
                            "linear-gradient(90deg, #8b5cf6, #6366f1)",
                        }}
                      />
                    </div>
                    <div className={styles.requestStats}>
                      <span>{formatDecimal(pct, 1)}%</span>
                      <span>{formatNumber(item.totalTokens)} tokens</span>
                      <span>{formatVND(item.estimatedCost)}</span>
                      <span className={styles.successText}>
                        {formatDecimal(item.successRate, 1)}% success
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Two Columns: Cost & Performance */}
      <div className={styles.twoCol}>
        {/* Cost Breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <div className={styles.cardIconWrapper}>
                <FontAwesomeIcon icon={faCoins} />
              </div>
              <div>
                <h3>Phân tích chi phí</h3>
                <p>Input vs Output tokens</p>
              </div>
            </div>
          </div>
          <div className={styles.costGrid}>
            <div className={styles.costCard}>
              <span className={styles.costLabel}>Tổng chi phí</span>
              <span className={styles.costMain}>
                {formatVND(cost.totalCost)}
              </span>
              <span className={styles.costSub}>
                {formatUSD(cost.totalCost)}
              </span>
            </div>
            <div className={styles.costCard}>
              <span className={styles.costLabel}>Trung bình / req</span>
              <span className={styles.costMain}>
                {formatUSD(cost.averageCostPerRequest)}
              </span>
            </div>
          </div>
          <div className={styles.costBreakdown}>
            <div className={styles.costRow}>
              <div className={styles.costRowLeft}>
                {/* <span
                  className={styles.costDot}
                  style={{ background: "#0ea792" }}
                /> */}
                <span>Input tokens</span>
              </div>
              <div className={styles.costRowRight}>
                <span className={styles.costRowValue}>
                  {formatVND(cost.inputCost)}
                </span>
                <span className={styles.costRowTokens}>
                  {formatNumber(cost.totalInputTokens)} tokens
                </span>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${clampPct(getPct(cost.inputCost, cost.totalCost))}%`,
                  background: "#0ea792",
                }}
              />
            </div>
            <div className={styles.costRow}>
              <div className={styles.costRowLeft}>
                {/* <span
                  className={styles.costDot}
                  style={{ background: "#0ea792" }}
                /> */}
                <span>Output tokens</span>
              </div>
              <div className={styles.costRowRight}>
                <span className={styles.costRowValue}>
                  {formatVND(cost.outputCost)}
                </span>
                <span className={styles.costRowTokens}>
                  {formatNumber(cost.totalOutputTokens)} tokens
                </span>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${clampPct(getPct(cost.outputCost, cost.totalCost))}%`,
                  background: "#0ea792",
                }}
              />
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <div className={styles.cardIconWrapper}>
                <FontAwesomeIcon icon={faGaugeHigh} />
              </div>
              <div>
                <h3>Hiệu năng</h3>
                <p>Tốc độ phản hồi & độ ổn định</p>
              </div>
            </div>
          </div>
          <div className={styles.performanceGrid}>
            <div className={styles.performanceCard}>
              <span className={styles.perfLabel}>Success rate</span>
              <span className={styles.perfValue} style={{ color: "#15cf1f" }}>
                {formatDecimal(performance.successRate, 1)}%
              </span>
              <div className={styles.donutChart}>
                <svg viewBox="0 0 100 100" className={styles.donutSvg}>
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#15cf1f"
                    strokeWidth="10"
                    strokeDasharray={`${(performance.successRate || 0) * 2.64} ${264 - (performance.successRate || 0) * 2.64}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    className={styles.donutCircle}
                  />
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    fontSize="18"
                    fontWeight="700"
                    fill="#1e293b"
                  >
                    {Math.round(performance.successRate || 0)}%
                  </text>
                </svg>
              </div>
            </div>
            <div className={styles.performanceCard}>
              <span className={styles.perfLabel}>Avg response</span>
              <span className={styles.perfValue}>
                {formatMs(performance.averageResponseTimeMs)}
              </span>
              <div className={styles.perfRange}>
                <span>Min {formatMs(performance.fastestResponseTimeMs)}</span>
                <span>Max {formatMs(performance.slowestResponseTimeMs)}</span>
              </div>
            </div>
            <div className={styles.performanceCard}>
              <span className={styles.perfLabel}>Total errors</span>
              <span className={styles.perfValue} style={{ color: "#ef4444" }}>
                {formatNumber(performance.totalErrors)}
              </span>
              <span className={styles.perfSub}>
                Error rate: {formatDecimal(performance.errorRate, 1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Students */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <div className={styles.cardIconWrapper}>
              <FontAwesomeIcon icon={faCrown} />
            </div>
            <div>
              <h3>Top học viên</h3>
              <p>Những người dùng tích cực nhất</p>
            </div>
          </div>
          <div className={styles.cardBadge}>
            <span className={styles.cardBadgeNumber}>
              {formatNumber(
                topStudents.reduce((s, i) => s + Number(i.requests || 0), 0),
              )}
            </span>
            <span>requests</span>
          </div>
        </div>
        {topStudents.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Học viên</th>
                  <th>Requests</th>
                  <th>Tokens</th>
                  <th>Chi phí</th>
                  <th>Tỷ trọng</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((s, i) => {
                  const pct = getPct(s.requests, overview.totalRequests);
                  return (
                    <tr key={s.studentId || i}>
                      <td>
                        <span
                          className={i === 0 ? styles.rankGold : styles.rank}
                        >
                          {i === 0 ? <FontAwesomeIcon icon={faCrown} /> : i + 1}
                        </span>
                      </td>
                      <td>
                        <div className={styles.studentInfo}>
                          <div className={styles.avatar}>
                            {s.studentName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className={styles.studentName}>
                              {s.studentName || "N/A"}
                            </span>
                            <span className={styles.studentId}>
                              #{s.studentId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.requestCount}>
                          {formatNumber(s.requests)}
                        </span>
                      </td>
                      <td>{formatNumber(s.totalTokens)}</td>
                      <td className={styles.costCell}>
                        {formatVND(s.estimatedCost)}
                      </td>
                      <td>
                        <div className={styles.pctWrapper}>
                          <span className={styles.pctValue}>
                            {formatDecimal(pct, 1)}%
                          </span>
                          <div className={styles.pctBar}>
                            <div style={{ width: `${clampPct(pct)}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>Chưa có dữ liệu</div>
        )}
      </div>
    </div>
  );
}

export default StatsTab;
