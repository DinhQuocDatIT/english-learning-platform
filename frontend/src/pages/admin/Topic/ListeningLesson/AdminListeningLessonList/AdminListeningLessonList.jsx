import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faPlus,
  faSearch,
  faEllipsisV,
  faCrown,
  faBook,
  faImage,
  faTag,
  faArrowLeft,
  faFilter,
  faClock,
  faList,
  faHourglassHalf,
  faCheckCircle,
  faXmarkCircle,
  faGlobe,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import adminTopicService from "../../../../../services/adminTopicService";
import listeningLessonService from "../../../../../services/listeningLessonService";
import getImageUrl from "../../../../../utils/imageUrl";
import { useLoading } from "../../../../../contexts/LoadingContext";

import styles from "./AdminListeningLessonList.module.css";

// Map trạng thái từ tiếng Anh sang tiếng Việt
const STATUS_MAP = {
  DRAFT: "Nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  PUBLISHED: "Đã phát hành",
};

// Map màu sắc cho từng trạng thái
const STATUS_COLOR_MAP = {
  DRAFT: "#fbbf24",
  PENDING: "#60a5fa",
  APPROVED: "#a78bfa",
  REJECTED: "#f87171",
  PUBLISHED: "#34d399",
};

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "PUBLISHED", label: "Đã phát hành" },
  { value: "DRAFT", label: "Nháp" },
];

// Cấu hình cho stats
const STATS_CONFIG = [
  {
    key: "all",
    label: "Tổng số",
    icon: faList,
    className: "statAll",
  },
  {
    key: "pending",
    label: "Chờ duyệt",
    icon: faHourglassHalf,
    className: "statPending",
  },
  {
    key: "approved",
    label: "Đã duyệt",
    icon: faCheckCircle,
    className: "statApproved",
  },
  {
    key: "rejected",
    label: "Từ chối",
    icon: faXmarkCircle,
    className: "statRejected",
  },
  {
    key: "published",
    label: "Đã phát hành",
    icon: faGlobe,
    className: "statPublished",
  },
];

function AdminListeningLessonList() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Filter
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
  });

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      showLoading();

      // Nếu có topicId -> lấy theo topic, không -> lấy tất cả (Admin)
      const [topicResponse, lessonResponse] = await Promise.all([
        topicId
          ? adminTopicService.getById(topicId)
          : Promise.resolve({ data: { data: null } }),
        topicId
          ? listeningLessonService.getByTopic(topicId)
          : listeningLessonService.getAllForAdmin(),
      ]);

      const topicData = topicResponse?.data?.data;
      const lessonData = lessonResponse?.data?.data;

      setTopic(topicData || null);
      setLessons(Array.isArray(lessonData) ? lessonData : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách bài nghe:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách bài nghe.",
      );
      setLessons([]);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  // Filter
  const filteredLessons = lessons.filter((lesson) => {
    const keyword = filters.keyword.trim().toLowerCase();
    const matchKeyword =
      !keyword || lesson.title?.toLowerCase().includes(keyword);

    const matchStatus = !filters.status || lesson.status === filters.status;

    return matchKeyword && matchStatus;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ keyword: "", status: "" });
  };

  const handleGoBack = () => {
    navigate(`/dashboard/admin/topics`);
  };

  // ===== NAVIGATION =====
  const handleViewLesson = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/admin/topics/${topicId}/listening-lessons/${lessonId}`,
    );
  };

  const handleViewSentenceList = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/admin/topics/${topicId}/listening-lessons/${lessonId}/view`,
    );
  };

  // Stats
  const statusCount = {
    all: lessons.length,
    pending: lessons.filter((l) => l.status === "PENDING").length,
    approved: lessons.filter((l) => l.status === "APPROVED").length,
    rejected: lessons.filter((l) => l.status === "REJECTED").length,
    published: lessons.filter((l) => l.status === "PUBLISHED").length,
  };

  const getStatValue = (key) => statusCount[key] || 0;

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyState}>
          <h3>Đang tải...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerTop}>
        <button className={styles.backButton} onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {STATS_CONFIG.map((stat) => {
          const value = getStatValue(stat.key);
          return (
            <div
              key={stat.key}
              className={`${styles.statCard} ${styles[stat.className]}`}
            >
              <div className={styles.statIconWrapper}>
                <FontAwesomeIcon icon={stat.icon} className={styles.statIcon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className={styles.filterCard}>
        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>Tìm kiếm</label>
          <div className={styles.searchInputWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Tìm theo tiêu đề..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Trạng thái</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={styles.selectInput}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={styles.clearFiltersBtn}
          onClick={handleClearFilters}
        >
          <FontAwesomeIcon icon={faFilter} />
          Xóa bộ lọc
        </button>
      </div>

      {/* Grid */}
      {filteredLessons.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faClock} className={styles.emptyIcon} />
          <h3>Không tìm thấy bài nghe nào</h3>
          <p>
            {lessons.length === 0
              ? "Chưa có bài nghe nào trong hệ thống."
              : "Không có kết quả phù hợp với bộ lọc."}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`${styles.card} ${lesson.isPremium ? styles.pro : ""}`}
            >
              {/* Image */}
              <div className={styles.imageWrapper}>
                {getImageUrl(lesson.lessonImage) ? (
                  <img
                    src={getImageUrl(lesson.lessonImage)}
                    alt={lesson.title}
                    className={styles.lessonImage}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />
                ) : null}

                <div
                  className={styles.fallbackGradient}
                  style={{
                    display: getImageUrl(lesson.lessonImage) ? "none" : "flex",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHeadphones}
                    className={styles.fallbackIcon}
                  />
                </div>

                <div className={styles.imageOverlay} />

                {/* Level */}
                {lesson.levelName && (
                  <span
                    className={styles.levelBadge}
                    style={{
                      color: lesson.levelColor || "#ffffff",
                    }}
                  >
                    {lesson.levelName}
                  </span>
                )}

                {/* Premium */}
                {lesson.isPremium && (
                  <span className={styles.premiumBadge}>
                    <FontAwesomeIcon icon={faCrown} />
                    Pro
                  </span>
                )}

                {/* Status */}
                {lesson.status && (
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor:
                        STATUS_COLOR_MAP[lesson.status] || "#64748b",
                    }}
                  >
                    {STATUS_MAP[lesson.status] || lesson.status}
                  </span>
                )}

                {/* Menu */}
                <div className={styles.actionContainer}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() =>
                      setActiveMenuId(
                        activeMenuId === lesson.id ? null : lesson.id,
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>

                  {activeMenuId === lesson.id && (
                    <div className={styles.dropdownMenu}>
                      <button
                        type="button"
                        onClick={() => handleViewLesson(lesson.id)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                        Xem chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewSentenceList(lesson.id)}
                      >
                        <FontAwesomeIcon icon={faList} />
                        Xem câu hỏi
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{lesson.title}</h3>

                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <span className={styles.metaLabel}>Người tạo</span>
                    <span className={styles.metaValue}>
                      {lesson.createdByName || "N/A"}
                    </span>
                  </span>
                  <span className={styles.metaItem}>
                    <span className={styles.metaLabel}>Cập nhật</span>
                    <span className={styles.metaValue}>
                      {lesson.updatedAt
                        ? new Date(lesson.updatedAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminListeningLessonList;
