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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import teacherTopicService from "../../../../services/teacherTopicService";
import listeningLessonService from "../../../../services/listeningLessonService";
import getImageUrl from "../../../../utils/imageUrl";

import styles from "./TeacherListeningLessonList.module.css";

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

function TeacherListeningLessonList() {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

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

  // 👇 KHI CLICK VÀO CARD -> VÀO TRANG QUẢN LÝ CÂU HỎI
  const handleCardClick = (lessonId) => {
    navigate(
      `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}/sentences`,
    );
  };

  // 👇 MENU: Xem chi tiết (vẫn giữ)
  const handleViewLesson = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}`,
    );
  };

  const handleEditLesson = (lessonId) => {
    setActiveMenuId(null);
    navigate(
      `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}/edit`,
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
          <label className={styles.filterLabel}>Tìm kiếm bài nghe</label>
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
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`${styles.card} ${lesson.isPremium ? styles.pro : ""}`}
              onClick={() => handleCardClick(lesson.id)} // 👈 CLICK VÀO CARD
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
                    display: getImageUrl(lesson.lessonImage) ? "none" : "flex",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHeadphones}
                    className={styles.fallbackIcon}
                  />
                </div>

                {/* Overlay */}
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

                {/* Status - Tiếng Việt */}
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
                    onClick={(e) => {
                      e.stopPropagation(); // 👈 KHÔNG BẮN SỰ KIỆN LÊN CARD
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
                          handleViewLesson(lesson.id);
                        }}
                      >
                        Xem chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(lesson.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faLanguage} />
                        Quản lý câu hỏi
                      </button>
                      {lesson.status === "DRAFT" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLesson(lesson.id);
                          }}
                        >
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{lesson.title}</h3>

                {/* Meta */}
                <div className={styles.cardMeta}>
                  {lesson.createdByName && (
                    <span className={styles.metaItem}>
                      <span className={styles.metaValue}>
                        {lesson.createdByName}
                      </span>
                    </span>
                  )}

                  {lesson.updatedAt && (
                    <span className={styles.metaItem}>
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

export default TeacherListeningLessonList;
