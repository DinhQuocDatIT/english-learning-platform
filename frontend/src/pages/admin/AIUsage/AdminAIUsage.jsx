// frontend/src/pages/admin/AIUsage/AdminAIUsage.jsx
import React, { useState, useEffect } from "react";
import {
  faRobot,
  faChartBar,
  faDollarSign,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import aiUsageService from "../../../services/aiUsageService";
import pricingService from "../../../services/pricingService";
import StatsTab from "../../../components/StatsTab/StatsTab";
import PricingTab from "../../../components/PricingTab/PricingTab";
import styles from "./AdminAIUsage.module.css";

function AdminAIUsage() {
  // State
  const [activeTab, setActiveTab] = useState("stats");
  const [dashboard, setDashboard] = useState(null);
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [topLimit, setTopLimit] = useState(5);

  // Fetch data
  useEffect(() => {
    if (activeTab === "stats") {
      fetchDashboard();
    } else {
      fetchPricings();
    }
  }, [activeTab, dateRange, topLimit]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const startDateObj = new Date(dateRange.startDate);
      const endDateObj = new Date(dateRange.endDate);
      endDateObj.setHours(23, 59, 59, 999);

      const response = await aiUsageService.getDashboard({
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        topLimit: topLimit,
      });
      setDashboard(response?.data?.data);
    } catch (error) {
      console.error("Lỗi lấy dashboard:", error);
      toast.error("Không thể tải dashboard AI Usage");
    } finally {
      setLoading(false);
    }
  };

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await pricingService.getAll();
      setPricings(response?.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy pricing:", error);
      toast.error("Không thể tải danh sách pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    if (activeTab === "stats") {
      fetchDashboard();
    } else {
      fetchPricings();
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FontAwesomeIcon icon={faRobot} className={styles.titleIcon} />
          Quản lý AI Usage & Pricing
        </h1>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "stats" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("stats")}
        >
          <FontAwesomeIcon icon={faChartBar} />
          Thống kê
        </button>
        <button
          className={`${styles.tab} ${activeTab === "pricing" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("pricing")}
        >
          <FontAwesomeIcon icon={faDollarSign} />
          Quản lý giá
        </button>
      </div>

      {/* Filter - chỉ hiển thị ở tab stats */}
      {activeTab === "stats" && (
        <div className={styles.filterBar}>
          <div className={styles.dateFilter}>
            <div className={styles.dateInputGroup}>
              <label>Từ ngày</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className={styles.dateInputGroup}>
              <label>Đến ngày</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
          <button className={styles.refreshBtn} onClick={handleRefresh}>
            <FontAwesomeIcon icon={faSearch} />
            Cập nhật
          </button>
        </div>
      )}

      {/* Content */}
      <div className={styles.tabContent}>
        {activeTab === "stats" ? (
          <StatsTab dashboard={dashboard} loading={loading} />
        ) : (
          <PricingTab
            pricings={pricings}
            loading={loading}
            onRefresh={fetchPricings}
          />
        )}
      </div>
    </div>
  );
}

export default AdminAIUsage;
