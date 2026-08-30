import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faSearch,
  faCrown,
  faBook,
  faImage,
  faTag,
  faArrowLeft,
  faPlayCircle,
  faClock,
  faGraduationCap,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import topicService from "../../../../services/topicService";
import listeningLessonService from "../../../../services/listeningLessonService";
import getImageUrl from "../../../../utils/imageUrl";
import { useLoading } from "../../../../contexts/LoadingContext";

import styles from "./StudentLessonList.module.css";

function StudentLessonList() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      showLoading();

      const [topicResponse, lessonResponse] = await Promise.all([
        topicService.getById(topicId),
        listeningLessonService.getPublishedByTopic(topicId),
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
    const keyword = searchKeyword.trim().toLowerCase();
    return !keyword || lesson.title?.toLowerCase().includes(keyword);
  });

  const handleGoBack = () => {
    navigate(`/dashboard/student/topics`);
  };

  const handleLessonClick = (lessonId) => {
    navigate(
      `/dashboard/student/topics/${topicId}/lessons/${lessonId}/preview`,
    );
  };

  // Hàm random số lượng người học (tạm thời)
  const getLearnerCount = () => {
    const counts = [127, 89, 234, 56, 312, 45, 178, 93, 256, 67];
    return counts[Math.floor(Math.random() * counts.length)];
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

      {/* Search */}
      <div className={styles.filterCard}>
        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>Tìm kiếm bài học</label>
          <div className={styles.searchInputWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tiêu đề..."
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <span className={styles.statsText}>
          <FontAwesomeIcon icon={faBook} />
          {filteredLessons.length} bài học
        </span>
        <span className={styles.statsText}>
          <FontAwesomeIcon icon={faPlayCircle} />
          {filteredLessons.filter((l) => l.isPremium).length} bài Premium
        </span>
      </div>

      {/* Grid */}
      {filteredLessons.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faHeadphones} className={styles.emptyIcon} />
          <h3>Không tìm thấy bài học nào</h3>
          <p>
            {lessons.length === 0
              ? "Topic này chưa có bài học nào được phát hành."
              : "Không có kết quả phù hợp."}
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
                onClick={() => handleLessonClick(lesson.id)}
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

                  {/* Play Button Overlay */}
                  <div className={styles.playOverlay}>
                    <div className={styles.playBtn}>
                      <FontAwesomeIcon icon={faPlayCircle} />
                    </div>
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
                      {/* <span className={styles.metaItem}>
                        <FontAwesomeIcon icon={faClock} />
                        {lesson.createdAt
                          ? new Date(lesson.createdAt).toLocaleDateString(
                              "vi-VN",
                            )
                          : "N/A"}
                      </span> */}
                    </div>
                    <button className={styles.startBtn}>
                      Bắt đầu
                      <FontAwesomeIcon icon={faPlayCircle} />
                    </button>
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

export default StudentLessonList;
