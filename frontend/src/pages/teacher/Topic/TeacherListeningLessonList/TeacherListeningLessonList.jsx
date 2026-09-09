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
  faLanguage,
  faUsers,
  faClock,
  faGraduationCap,
  faPlay,
  faTrash,
  faEye,
  faPen
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import teacherTopicService from "../../../../services/teacherTopicService";
import listeningLessonService from "../../../../services/listeningLessonService";
import getImageUrl from "../../../../utils/imageUrl";

import styles from "./TeacherListeningLessonList.module.css";
import { STATUS_MAP, STATUS_BG_COLOR_MAP } from "../../../../constants/status";

function TeacherListeningLessonList() {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [filters, setFilters] = useState({
    keyword: "",
  });

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [topicResponse, lessonResponse] = await Promise.all([
        teacherTopicService.getById(topicId),
        listeningLessonService.getMyLessonsByTopic(topicId),
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
    }
  };

  // Filter
  const filteredLessons = lessons.filter((lesson) => {
    const keyword = filters.keyword.trim().toLowerCase();
    return !keyword || lesson.title?.toLowerCase().includes(keyword);
  });

  const handleFilterChange = (e) => {
    setFilters({ keyword: e.target.value });
  };

  const handleGoBack = () => {
    navigate(`/dashboard/teacher/topics`);
  };

  const handleCreate = () => {
    navigate(`/dashboard/teacher/topics/${topicId}/listening-lessons/create`);
  };

  // Click vào card -> vào trang quản lý câu hỏi
  const handleCardClick = (lessonId) => {
    navigate(
      `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}/sentences`,
    );
  };

  // Xem chi tiết
  const handleViewLesson = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}`,
    );
  };

  // Chỉnh sửa
  const handleEditLesson = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}/edit`,
    );
  };

  // ===== XÓA CỨNG (HARD DELETE) =====
  const handleHardDelete = async (lesson) => {
    // Kiểm tra trạng thái có được xóa không
    if (lesson.status !== "DRAFT" && lesson.status !== "REJECTED") {
      toast.warning(
        `Bài học "${lesson.title}" đang ở trạng thái ${STATUS_MAP[lesson.status] || lesson.status}. Chỉ có thể xóa khi ở trạng thái Nháp (DRAFT) hoặc Từ chối (REJECTED).`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn XÓA bài học "${lesson.title}" không?\n` +
        `Hành động này sẽ xóa hoàn toàn bài học và tất cả câu hỏi bên trong.\n` +
        `Không thể khôi phục!`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(lesson.id);
      await listeningLessonService.hardDelete(lesson.id);
      toast.success(`Xóa bài học "${lesson.title}" thành công!`);
      await fetchData(); // Refresh danh sách
    } catch (error) {
      console.error("Lỗi xóa bài học:", error);
      const message = error.response?.data?.message || "Không thể xóa bài học.";
      toast.error(message);
    } finally {
      setDeletingId(null);
      setActiveMenuId(null);
    }
  };

  // Kiểm tra có thể chỉnh sửa không (DRAFT hoặc REJECTED)
  const canEdit = (status) => {
    return status === "DRAFT" || status === "REJECTED";
  };

  // Kiểm tra có thể xóa không (DRAFT hoặc REJECTED)
  const canDelete = (status) => {
    return status === "DRAFT" || status === "REJECTED";
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
      </div>

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

          <button
            type="button"
            className={styles.topicHeroBtn}
            onClick={handleCreate}
          >
            <FontAwesomeIcon icon={faPlus} />
            Thêm Bài nghe Mới
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={styles.filterCard}>
        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>Tìm kiếm bài học</label>
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
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <span className={styles.statsText}>
          <FontAwesomeIcon icon={faBook} />
          {filteredLessons.length} bài học
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
          <FontAwesomeIcon icon={faHeadphones} className={styles.emptyIcon} />
          <h3>Không tìm thấy bài nghe nào</h3>
          <p>
            {lessons.length === 0
              ? "Hãy tạo bài nghe đầu tiên."
              : "Không có kết quả phù hợp."}
          </p>

          {lessons.length === 0 && (
            <button
              type="button"
              className={styles.emptyAddBtn}
              onClick={handleCreate}
            >
              <FontAwesomeIcon icon={faPlus} />
              Tạo bài nghe
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredLessons.map((lesson) => {
            const isEditable = canEdit(lesson.status);
            const isDeletable = canDelete(lesson.status);
            const isDeleting = deletingId === lesson.id;

            return (
              <div
                key={lesson.id}
                className={`${styles.card} ${lesson.isPremium ? styles.pro : ""}`}
                onClick={() => handleCardClick(lesson.id)}
                style={{ cursor: "pointer" }}
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
                          STATUS_BG_COLOR_MAP[lesson.status] || "#64748b",
                      }}
                    >
                      {STATUS_MAP[lesson.status] || lesson.status}
                    </span>
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
                        
                  
                        {isEditable && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditLesson(lesson.id);
                            }}
                          >
                            <FontAwesomeIcon icon={faPen} />
                            Chỉnh sửa
                          </button>
                        )}

                        {/* 3. Xem chi tiết - luôn hiển thị */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewLesson(lesson.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                          Xem chi tiết
                        </button>

                        {/* 4. Xóa - chỉ hiển thị khi DRAFT hoặc REJECTED */}
                        {isDeletable && (
                          <button
                            type="button"
                            className={styles.deleteMenuItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHardDelete(lesson);
                            }}
                            disabled={isDeleting}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            {isDeleting ? "Đang xóa..." : "Xóa"}
                          </button>
                        )}
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

export default TeacherListeningLessonList;
