import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
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
  faUsers,
  faPlayCircle,
  faGraduationCap,
  faFileAlt,
  faPlay,
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

  // ===== CLICK CARD -> XEM CÂU HỎI =====
  const handleCardClick = (lessonId) => {
    navigate(
      `/dashboard/admin/topics/${topicId}/listening-lessons/${lessonId}/view`,
    );
  };

  // ===== MENU -> XEM CHI TIẾT =====
  const handleViewDetail = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/admin/topics/${topicId}/listening-lessons/${lessonId}`,
    );
  };

  // ===== MENU -> XEM CÂU HỎI =====
  const handleViewSentences = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/admin/topics/${topicId}/listening-lessons/${lessonId}/view`,
    );
  };

  // Hàm random số lượng người học (tạm thời)
  const getLearnerCount = () => {
    const counts = [
      127, 89, 234, 56, 312, 45, 178, 93, 256, 67, 543, 23, 189, 76, 432,
    ];
    return counts[Math.floor(Math.random() * counts.length)];
  };

  // Stats
  const statusCount = {
    all: lessons.length,
    draft: lessons.filter((l) => l.status === "DRAFT").length,
    pending: lessons.filter((l) => l.status === "PENDING").length,
    approved: lessons.filter((l) => l.status === "APPROVED").length,
    rejected: lessons.filter((l) => l.status === "REJECTED").length,
    published: lessons.filter((l) => l.status === "PUBLISHED").length,
  };

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

      {/* Stats - Simple & Clean */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statAll}`}>
          <div className={styles.statIconWrapper}>
            <FontAwesomeIcon icon={faList} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{statusCount.all}</span>
            <span className={styles.statLabel}>Tổng số</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statDraft}`}>
          <div className={styles.statIconWrapper}>
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{statusCount.draft}</span>
            <span className={styles.statLabel}>Nháp</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statPending}`}>
          <div className={styles.statIconWrapper}>
            <FontAwesomeIcon icon={faHourglassHalf} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{statusCount.pending}</span>
            <span className={styles.statLabel}>Chờ duyệt</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statApproved}`}>
          <div className={styles.statIconWrapper}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{statusCount.approved}</span>
            <span className={styles.statLabel}>Đã duyệt</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statRejected}`}>
          <div className={styles.statIconWrapper}>
            <FontAwesomeIcon icon={faXmarkCircle} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{statusCount.rejected}</span>
            <span className={styles.statLabel}>Từ chối</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statPublished}`}>
          <div className={styles.statIconWrapper}>
            <FontAwesomeIcon icon={faGlobe} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{statusCount.published}</span>
            <span className={styles.statLabel}>Đã phát hành</span>
          </div>
        </div>
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

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <span className={styles.statsText}>
          <FontAwesomeIcon icon={faBook} />
          {filteredLessons.length} bài học
        </span>
        <span className={styles.statsText}>
          <FontAwesomeIcon icon={faPlayCircle} />
          {filteredLessons.filter((l) => l.isPremium).length} bài Premium
        </span>
        <span className={styles.statsText}>
          <FontAwesomeIcon icon={faUsers} />
          {filteredLessons.reduce(
            (sum, lesson) => sum + (lesson.studentCount || 0),
            0,
          )}{" "}
          học viên
        </span>
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
          {filteredLessons.map((lesson) => {
            const learnerCount = getLearnerCount();
            return (
              <div
                key={lesson.id}
                className={`${styles.card} ${lesson.isPremium ? styles.pro : ""}`}
                onClick={() => handleCardClick(lesson.id)}
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
                      display: getImageUrl(lesson.lessonImage)
                        ? "none"
                        : "flex",
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
                      Premium
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

                  {/* Play Overlay - Giống Student */}
                  <div className={styles.playOverlay}>
                    <div className={styles.playBtn}>
                      <FontAwesomeIcon icon={faPlay} />
                    </div>
                  </div>

                  {/* Menu */}
                  <div className={styles.actionContainer}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          activeMenuId === lesson.id ? null : lesson.id,
                        );
                      }}
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>

                    {activeMenuId === lesson.id && (
                      <div className={styles.dropdownMenu}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(lesson.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                          Xem chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSentences(lesson.id);
                          }}
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
                  {lesson.description && (
                    <p className={styles.cardDescription}>
                      {lesson.description}
                    </p>
                  )}

                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>
                        <FontAwesomeIcon icon={faUsers} />
                        {lesson.studentCount || 0} học viên
                      </span>
                      <span className={styles.metaItem}>
                        <FontAwesomeIcon icon={faClock} />
                        {lesson.updatedAt
                          ? new Date(lesson.updatedAt).toLocaleDateString(
                              "vi-VN",
                            )
                          : "N/A"}
                      </span>
                      <span className={styles.metaItem}>
                        <FontAwesomeIcon icon={faGraduationCap} />
                        {lesson.createdByName || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminListeningLessonList;
