// frontend/src/pages/admin/AIUsage/components/StatsTab.jsx
import React from "react";
import {
  faCoins,
  faClock,
  faChartLine,
  faSpinner,
  faCalendarAlt,
  faCheckCircle,
  faArrowUp,
  faArrowDown,
  faUser,
  faCrown,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./StatsTab.module.css";

function StatsTab({ dashboard, loading }) {
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString();
  };

  const formatVND = (amount) => {
    if (!amount || amount === 0) return "0 ₫";
    const exchangeRate = 25000;
    const vndAmount = amount * exchangeRate;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(vndAmount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderGrowth = (rate) => {
    if (rate === null || rate === undefined)
      return <span className={styles.growthNeutral}>-</span>;
    if (rate > 0) {
      return (
        <span className={styles.growthUp}>
          <FontAwesomeIcon icon={faArrowUp} /> {rate}%
        </span>
      );
    }
    return (
      <span className={styles.growthDown}>
        <FontAwesomeIcon icon={faArrowDown} /> {Math.abs(rate)}%
      </span>
    );
  };

  const renderProgressBar = (percentage) => {
    return (
      <div className={styles.progressBarSmall}>
        <div
          className={styles.progressBarSmallFill}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  if (loading || !dashboard) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  const {
    overview,
    dailyChart,
    modelStats,
    monthlyReport,
    topStudents,
    successCount,
    failedCount,
    successRate,
  } = dashboard;

  return (
    <>
      {/* Overview Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.cardTotal}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>
              {formatNumber(overview?.totalRequests)}
            </span>
            <span className={styles.statLabel}>Tổng request</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cardTokens}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faCoins} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>
              {formatNumber(overview?.totalTokens)}
            </span>
            <span className={styles.statLabel}>Tổng token</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cardCost}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faCoins} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>
              {formatVND(overview?.totalCost)}
            </span>
            <span className={styles.statLabel}>Tổng chi phí</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cardTime}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>
              {overview?.avgResponseTimeMs?.toFixed(0) || 0}ms
            </span>
            <span className={styles.statLabel}>Response TB</span>
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          Biểu đồ theo ngày
        </h2>
        {dailyChart && dailyChart.length > 0 ? (
          <div className={styles.chartWrapper}>
            <div className={styles.chartBars}>
              {dailyChart.map((day, idx) => {
                const maxCost = Math.max(...dailyChart.map((d) => d.cost));
                const height = maxCost > 0 ? (day.cost / maxCost) * 100 : 0;
                return (
                  <div key={idx} className={styles.chartBarGroup}>
                    <div className={styles.chartBarWrapper}>
                      <div
                        className={styles.chartBar}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      >
                        <span className={styles.chartBarValue}>
                          {formatVND(day.cost)}
                        </span>
                      </div>
                    </div>
                    <span className={styles.chartBarLabel}>
                      {formatDate(day.date)}
                    </span>
                    <span className={styles.chartBarSub}>
                      {day.requests} req
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className={styles.noData}>Không có dữ liệu</p>
        )}
      </div>

      {/* Two Columns */}
      <div className={styles.twoColumns}>
        {/* Model Stats */}
        <div className={`${styles.chartSection} ${styles.columnLeft}`}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faRobot} />
            Thống kê theo Model
          </h2>
          {modelStats && modelStats.length > 0 ? (
            <div className={styles.modelList}>
              {modelStats.map((model, idx) => (
                <div key={idx} className={styles.modelItem}>
                  <div className={styles.modelInfo}>
                    <span className={styles.modelName}>{model.model}</span>
                    <span className={styles.modelCost}>
                      {formatVND(model.cost)}
                    </span>
                  </div>
                  <div className={styles.modelBarWrapper}>
                    <div
                      className={styles.modelBar}
                      style={{
                        width: `${Math.min(model.percentage || 0, 100)}%`,
                      }}
                    />
                  </div>
                  <div className={styles.modelDetails}>
                    <span>{formatNumber(model.requests)} requests</span>
                    <span>{model.percentage || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>Không có dữ liệu</p>
          )}
        </div>

        {/* Monthly Report */}
        <div className={`${styles.chartSection} ${styles.columnRight}`}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faChartLine} />
            Báo cáo theo tháng
          </h2>
          {monthlyReport && monthlyReport.length > 0 ? (
            <table className={styles.monthlyTable}>
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Request</th>
                  <th>Token</th>
                  <th>Chi phí</th>
                  <th>Tăng trưởng</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.map((month, idx) => (
                  <tr key={idx}>
                    <td className={styles.monthName}>{month.month}</td>
                    <td>{formatNumber(month.requests)}</td>
                    <td>{formatNumber(month.tokens)}</td>
                    <td>{formatVND(month.cost)}</td>
                    <td>{renderGrowth(month.growthRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noData}>Không có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Success/Failed Stats */}
      <div className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faCheckCircle} />
          Tỷ lệ thành công
        </h2>
        <div className={styles.successStats}>
          <div className={styles.successStatItem}>
            <span className={styles.successStatValue}>{successCount || 0}</span>
            <span className={styles.successStatLabel}>Thành công</span>
          </div>
          <div className={styles.successStatItem}>
            <span className={styles.successStatValue}>{failedCount || 0}</span>
            <span className={styles.successStatLabel}>Thất bại</span>
          </div>
          <div className={styles.successStatItem}>
            <span className={styles.successStatValue}>{successRate || 0}%</span>
            <span className={styles.successStatLabel}>Tỷ lệ thành công</span>
          </div>
        </div>
      </div>

      {/* Top Students */}
      <div className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faCrown} />
          Top học viên sử dụng nhiều nhất
        </h2>
        {topStudents && topStudents.length > 0 ? (
          <div className={styles.topStudentsList}>
            <table className={styles.topStudentsTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Học viên</th>
                  <th>Số request</th>
                  <th>Token</th>
                  <th>Chi phí</th>
                  <th>%</th>
                  <th>Biểu đồ</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student, idx) => (
                  <tr key={idx}>
                    <td className={styles.rankNumber}>#{idx + 1}</td>
                    <td>
                      <span className={styles.studentName}>
                        <FontAwesomeIcon
                          icon={faUser}
                          className={styles.studentIcon}
                        />
                        {student.studentName || "N/A"}
                      </span>
                    </td>
                    <td>{formatNumber(student.requests)}</td>
                    <td>{formatNumber(student.tokens)}</td>
                    <td className={styles.costCell}>
                      {formatVND(student.cost)}
                    </td>
                    <td>{student.percentage || 0}%</td>
                    <td>{renderProgressBar(student.percentage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.noData}>Chưa có dữ liệu học viên</p>
        )}
      </div>
    </>
  );
}

export default StatsTab;
