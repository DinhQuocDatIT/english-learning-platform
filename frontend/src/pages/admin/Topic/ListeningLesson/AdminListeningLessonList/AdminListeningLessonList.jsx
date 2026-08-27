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
  faCheck,
  faTimes,
  faRocket,
  faFilter,
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

function AdminListeningLessonList() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

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
        adminTopicService.getById(topicId),
        listeningLessonService.getByTopic(topicId),
      ]);

      const topicData = topicResponse?.data?.data;
      const lessonData = lessonResponse?.data?.data;

      setTopic(topicData || null);
      setLessons(Array.isArray(lessonData) ? lessonData : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách bài nghe:", error);
      const message =
        error.response?.data?.message || "Không thể tải danh sách bài nghe.";
      toast.error(message);
      setTopic(null);
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

  // =========================
  // ADMIN ACTIONS
  // =========================

  // Approve - PENDING → APPROVED
  const handleApprove = async (lessonId) => {
    const confirmed = window.confirm("Bạn chắc chắn muốn duyệt bài nghe này?");
    if (!confirmed) return;

    try {
      showLoading();
      await listeningLessonService.approve(lessonId);
      toast.success("✅ Duyệt bài nghe thành công!");
      await fetchData();
    } catch (error) {
      console.error("Lỗi duyệt bài nghe:", error);
      toast.error(error.response?.data?.message || "Không thể duyệt bài nghe.");
    } finally {
      hideLoading();
      setActiveMenuId(null);
    }
  };

  // Reject - PENDING → REJECTED
  const handleReject = async (lessonId) => {
    const confirmed = window.confirm(
      "Bạn chắc chắn muốn từ chối bài nghe này?",
    );
    if (!confirmed) return;

    try {
      showLoading();
      await listeningLessonService.reject(lessonId);
      toast.success("❌ Từ chối bài nghe thành công!");
      await fetchData();
    } catch (error) {
      console.error("Lỗi từ chối bài nghe:", error);
      toast.error(
        error.response?.data?.message || "Không thể từ chối bài nghe.",
      );
    } finally {
      hideLoading();
      setActiveMenuId(null);
    }
  };

  // Publish - APPROVED → PUBLISHED
  const handlePublish = async (lessonId) => {
    const confirmed = window.confirm(
      "Bạn chắc chắn muốn phát hành bài nghe này?",
    );
    if (!confirmed) return;

    try {
      showLoading();
      await listeningLessonService.publish(lessonId);
      toast.success("🚀 Phát hành bài nghe thành công!");
      await fetchData();
    } catch (error) {
      console.error("Lỗi phát hành bài nghe:", error);
      toast.error(
        error.response?.data?.message || "Không thể phát hành bài nghe.",
      );
    } finally {
      hideLoading();
      setActiveMenuId(null);
    }
  };

  // =========================
  // NAVIGATION
  // =========================

  const handleViewLesson = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/admin/topics/${topicId}/listening-lessons/${lessonId}`,
    );
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
      {/* Header với nút quay lại */}
      <div className={styles.headerTop}>
        <button className={styles.backButton} onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Quay lại</span>
        </button>
        <h1 className={styles.pageTitle}>Quản lý bài nghe</h1>
      </div>

      {/* Topic Hero */}
      <div className={styles.topicHero}>
        <div className={styles.topicHeroImage}>
          {getImageUrl(topic?.topicImage) ? (
            <img
              src={getImageUrl(topic?.topicImage)}
              alt={topic?.title}
              className={styles.topicHeroImg}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={styles.topicHeroFallback}
            style={{
              display: getImageUrl(topic?.topicImage) ? "none" : "flex",
            }}
          >
            <FontAwesomeIcon icon={faImage} className={styles.topicHeroIcon} />
          </div>
          <div className={styles.topicHeroOverlay} />
        </div>

        <div className={styles.topicHeroContent}>
          <div className={styles.topicHeroMain}>
            <div className={styles.topicHeroStats}>
              <span className={styles.topicHeroStat}>
                <FontAwesomeIcon icon={faBook} /> {lessons.length} Bài học
              </span>
              {topic?.levelName && (
                <span className={styles.topicHeroStat}>
                  <FontAwesomeIcon icon={faTag} /> {topic.levelName}
                </span>
              )}
            </div>
            <h1 className={styles.topicHeroTitle}>{topic?.title || ""}</h1>
            <p className={styles.topicHeroDesc}>{topic?.description || ""}</p>
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
            <option value="">Tất cả</option>
            <option value="DRAFT">Nháp</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="PUBLISHED">Đã phát hành</option>
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
          <FontAwesomeIcon icon={faHeadphones} className={styles.emptyIcon} />
          <h3>Không tìm thấy bài nghe nào</h3>
          <p>
            {lessons.length === 0
              ? "Chưa có bài nghe nào trong topic này."
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
                        Xem chi tiết
                      </button>

                      {/* PENDING → Approve / Reject */}
                      {lesson.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            className={styles.approveBtn}
                            onClick={() => handleApprove(lesson.id)}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            Duyệt bài
                          </button>
                          <button
                            type="button"
                            className={styles.rejectBtn}
                            onClick={() => handleReject(lesson.id)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                            Từ chối
                          </button>
                        </>
                      )}

                      {/* APPROVED → Publish */}
                      {lesson.status === "APPROVED" && (
                        <button
                          type="button"
                          className={styles.publishBtn}
                          onClick={() => handlePublish(lesson.id)}
                        >
                          <FontAwesomeIcon icon={faRocket} />
                          Phát hành
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{lesson.title}</h3>

                <div className={styles.cardMeta}>
                  {lesson.createdByName && (
                    <span className={styles.metaItem}>
                      <span className={styles.metaLabel}>Người tạo</span>
                      <span className={styles.metaValue}>
                        {lesson.createdByName}
                      </span>
                    </span>
                  )}

                  {lesson.updatedAt && (
                    <span className={styles.metaItem}>
                      <span className={styles.metaLabel}>Cập nhật</span>
                      <span className={styles.metaValue}>
                        {new Date(lesson.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </span>
                  )}
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
