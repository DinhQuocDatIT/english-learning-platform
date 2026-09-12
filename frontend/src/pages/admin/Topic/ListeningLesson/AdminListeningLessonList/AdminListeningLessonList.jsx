import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faSearch,
  faEllipsisV,
  faCrown,
  faBook,
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
  faPlay,
  faTrash,
  faTrashRestore,
  faBan,
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

// Status options — BỎ DRAFT
const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "PUBLISHED", label: "Đã phát hành" },
];

// Trạng thái bị ẩn với Admin
const HIDDEN_STATUSES = ["DRAFT"];

function AdminListeningLessonList() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actioningId, setActioningId] = useState(null);

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
          ? listeningLessonService.getByTopicForAdmin(topicId)
          : listeningLessonService.getAllForAdmin(),
      ]);

      const topicData = topicResponse?.data?.data;
      const lessonData = lessonResponse?.data?.data;

      setTopic(topicData || null);

      // 🔥 LỌC BỎ DRAFT — Admin không thấy bài nháp của giáo viên
      const visibleLessons = Array.isArray(lessonData)
        ? lessonData.filter(
            (lesson) => !HIDDEN_STATUSES.includes(lesson.status),
          )
        : [];

      setLessons(visibleLessons);
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

  // Kiểm tra bài đã bị ẩn chưa
  const isDeleted = (lesson) => {
    return lesson.deletedAt !== null && lesson.deletedAt !== undefined;
  };

  // Filter theo keyword và status
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

  // ===== ADMIN - SOFT DELETE (ẨN BÀI) =====
  const handleSoftDelete = async (lesson) => {
    if (lesson.status !== "APPROVED" && lesson.status !== "PUBLISHED") {
      toast.warning(
        `Bài học "${lesson.title}" đang ở trạng thái ${STATUS_MAP[lesson.status] || lesson.status}. Chỉ có thể ẩn bài đã duyệt (APPROVED) hoặc đã phát hành (PUBLISHED).`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn ẨN bài học "${lesson.title}" không?\n` +
        `Bài học sẽ bị ẩn khỏi học sinh và giáo viên.\n` +
        `Có thể phục hồi sau.`,
    );

    if (!confirmed) return;

    try {
      setActioningId(lesson.id);
      await listeningLessonService.softDelete(lesson.id);
      toast.success(`Đã ẩn bài học "${lesson.title}" thành công!`);
      await fetchData();
    } catch (error) {
      console.error("Lỗi ẩn bài học:", error);
      const message = error.response?.data?.message || "Không thể ẩn bài học.";
      toast.error(message);
    } finally {
      setActioningId(null);
      setActiveMenuId(null);
    }
  };

  // ===== ADMIN - RESTORE (PHỤC HỒI BÀI ĐÃ ẨN) =====
  const handleRestore = async (lesson) => {
    if (!isDeleted(lesson)) {
      toast.warning(`Bài học "${lesson.title}" chưa bị ẩn.`);
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn PHỤC HỒI bài học "${lesson.title}" không?\n` +
        `Bài học sẽ hiển thị lại cho học sinh và giáo viên.`,
    );

    if (!confirmed) return;

    try {
      setActioningId(lesson.id);
      await listeningLessonService.restore(lesson.id);
      toast.success(`Phục hồi bài học "${lesson.title}" thành công!`);
      await fetchData();
    } catch (error) {
      console.error("Lỗi phục hồi bài học:", error);
      const message =
        error.response?.data?.message || "Không thể phục hồi bài học.";
      toast.error(message);
    } finally {
      setActioningId(null);
      setActiveMenuId(null);
    }
  };

  // Kiểm tra có thể ẩn không (APPROVED hoặc PUBLISHED)
  const canSoftDelete = (status) => {
    return status === "APPROVED" || status === "PUBLISHED";
  };

  // Stats — KHÔNG đếm DRAFT
  const statusCount = {
    all: lessons.length,
    pending: lessons.filter((l) => l.status === "PENDING" && !isDeleted(l))
      .length,
    approved: lessons.filter((l) => l.status === "APPROVED" && !isDeleted(l))
      .length,
    rejected: lessons.filter((l) => l.status === "REJECTED" && !isDeleted(l))
      .length,
    published: lessons.filter((l) => l.status === "PUBLISHED" && !isDeleted(l))
      .length,
    deleted: lessons.filter((l) => isDeleted(l)).length,
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

      {/* Stats — BỎ card DRAFT */}
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

      {/* Filter — BỎ option DRAFT */}
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
            const isDeletedLesson = isDeleted(lesson);
            const isActioning = actioningId === lesson.id;

            return (
              <div
                key={lesson.id}
                className={`${styles.card} ${lesson.isPremium ? styles.pro : ""} ${isDeletedLesson ? styles.cardDeleted : ""}`}
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

                  {/* Deleted Overlay */}
                  {isDeletedLesson && (
                    <div className={styles.deletedOverlay}>
                      <div className={styles.deletedOverlayContent}>
                        <FontAwesomeIcon
                          icon={faBan}
                          className={styles.deletedOverlayIcon}
                        />
                        <span className={styles.deletedOverlayText}>
                          BÀI ĐÃ BỊ ẨN
                        </span>
                        <span className={styles.deletedOverlaySub}>
                          Ẩn từ{" "}
                          {new Date(lesson.deletedAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Play Overlay */}
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

                        {/* Nút Ẩn */}
                        {!isDeletedLesson && canSoftDelete(lesson.status) && (
                          <button
                            type="button"
                            className={styles.softDeleteMenuItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSoftDelete(lesson);
                            }}
                            disabled={isActioning}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            {isActioning ? "Đang xử lý..." : "Ẩn bài"}
                          </button>
                        )}

                        {/* Nút Phục hồi */}
                        {isDeletedLesson && (
                          <button
                            type="button"
                            className={styles.restoreMenuItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(lesson);
                            }}
                            disabled={isActioning}
                          >
                            <FontAwesomeIcon icon={faTrashRestore} />
                            {isActioning ? "Đang xử lý..." : "Phục hồi"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <h3
                    className={`${styles.cardTitle} ${isDeletedLesson ? styles.cardTitleDeleted : ""}`}
                  >
                    {lesson.title}
                    {isDeletedLesson && (
                      <span className={styles.deletedTag}> (Đã ẩn)</span>
                    )}
                  </h3>
                  {lesson.description && (
                    <p
                      className={`${styles.cardDescription} ${isDeletedLesson ? styles.cardDescriptionDeleted : ""}`}
                    >
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
