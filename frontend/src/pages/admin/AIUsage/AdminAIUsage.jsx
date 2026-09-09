// frontend/src/pages/admin/AIUsage/AdminAIUsage.jsx

import React, { useEffect, useState } from "react";
import {
  faChartBar,
  faDollarSign,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

import pricingService from "../../../services/pricingService";

import StatsTab from "../../../components/StatsTab/StatsTab";
import PricingTab from "../../../components/PricingTab/PricingTab";

import styles from "./AdminAIUsage.module.css";

function AdminAIUsage() {
  // =========================================================
  // STATE
  // =========================================================

  const [activeTab, setActiveTab] = useState("stats");

  const [pricings, setPricings] = useState([]);

  const [loadingPricing, setLoadingPricing] = useState(false);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0],

    endDate: new Date()
      .toISOString()
      .split("T")[0],
  });

  // =========================================================
  // EFFECT
  // =========================================================

  useEffect(() => {
    if (activeTab === "pricing") {
      fetchPricings();
    }
  }, [activeTab]);

  // =========================================================
  // FETCH PRICING
  // =========================================================

  const fetchPricings = async () => {
    try {
      setLoadingPricing(true);

      const response = await pricingService.getAll();

      setPricings(response?.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy pricing:", error);
      console.error(
        "API error response:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách pricing"
      );
    } finally {
      setLoadingPricing(false);
    }
  };

  // =========================================================
  // DATE CHANGE
  // =========================================================

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // TAB CHANGE
  // =========================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className={styles.container}>
      {/* =====================================================
          TABS
      ===================================================== */}

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "stats"
              ? styles.tabActive
              : ""
          }`}
          onClick={() => handleTabChange("stats")}
        >
          <FontAwesomeIcon icon={faChartBar} />

          <span>Thống kê</span>
        </button>

        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "pricing"
              ? styles.tabActive
              : ""
          }`}
          onClick={() => handleTabChange("pricing")}
        >
          <FontAwesomeIcon icon={faDollarSign} />

          <span>Quản lý giá</span>
        </button>
      </div>

      {/* =====================================================
          STATS FILTER
      ===================================================== */}

      {activeTab === "stats" && (
        <div className={styles.filterBar}>
          <div className={styles.dateFilter}>
            <div className={styles.dateInputGroup}>
              <label htmlFor="startDate">
                Từ ngày
              </label>

              <input
                id="startDate"
                type="date"
                name="startDate"
                value={dateRange.startDate}
                max={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>

            <div className={styles.dateInputGroup}>
              <label htmlFor="endDate">
                Đến ngày
              </label>

              <input
                id="endDate"
                type="date"
                name="endDate"
                value={dateRange.endDate}
                min={dateRange.startDate}
                max={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className={styles.tabContent}>
        {activeTab === "stats" ? (
          <StatsTab
            from={dateRange.startDate}
            to={dateRange.endDate}
          />
        ) : (
          <PricingTab
            pricings={pricings}
            loading={loadingPricing}
            onRefresh={fetchPricings}
          />
        )}
      </div>
    </div>
  );
}

export default AdminAIUsage;